import os
import asyncio
import json
import pathlib
import ssl
import time
import psutil
from aiohttp import web
from collections import deque

# Fixed Credentials for 10 Users (username:password pairs)
VALID_CREDENTIALS = {
    "user1": "pass1",
    "user2": "pass2",
    "user3": "pass3",
    "user4": "pass4",
    "user5": "pass5",
    "user6": "pass6",
    "user7": "pass7",
    "user8": "pass8",
    "user9": "pass9",
    "user10": "pass10",
}

# In-Memory Storage for Sessions
CURRENT_LOGGED_USERS = {}  # Keeps track of currently logged-in users
LAST_LOGINS = deque(maxlen=10)  # Stores the last 10 login attempts

# Serve Static Files (HTML, CSS, JS files for the frontend)
async def serve_static(request):
    """
    Serves static files for the frontend (like login.html and dashboard.html).
    """
    filename = request.match_info.get("filename", "login.html")  # Default to 'login.html'
    subdir = request.match_info.get("subdir", "")  # Subdirectory if specified
    base_path = pathlib.Path(__file__).parent.joinpath("../frontend")
    file_path = base_path.joinpath(subdir, filename)

    if file_path.exists():
        return web.FileResponse(file_path)  # Return the requested file if it exists
    else:
        raise web.HTTPNotFound()  # Raise 404 if the file is not found

# Login Endpoint
async def api_login(request):
    """
    Handles user login by validating credentials and recording the session.
    """
    try:
        data = await request.json()  # Parse JSON payload
        username = data.get("username")
        password = data.get("password")
        client_ip = request.remote or "127.0.0.1"  # Capture client's IP address

        if username in VALID_CREDENTIALS and VALID_CREDENTIALS[username] == password:
            login_time = time.strftime("%Y-%m-%d %H:%M:%S")

            # Avoid duplicate entries in the login history
            login_entry = {"username": username, "login_time": login_time, "ip_address": client_ip}
            if not any(user["username"] == username for user in LAST_LOGINS):
                LAST_LOGINS.appendleft(login_entry)  # Add the entry to the deque

            # Update the currently logged-in users
            CURRENT_LOGGED_USERS[username] = login_entry

            return web.json_response({"status": "success", "message": "Login successful"})
        return web.json_response({"status": "failure", "message": "Invalid credentials"}, status=401)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)  # Handle unexpected errors gracefully

# Fetch Current Logged-In Users
async def api_current_users(request):
    """
    Returns a list of all currently logged-in users.
    """
    return web.json_response(list(CURRENT_LOGGED_USERS.values()))

# Fetch Last Logged Users
async def api_last_logged_users(request):
    """
    Returns a list of the last 10 users who logged in.
    """
    return web.json_response(list(LAST_LOGINS))

# System Stats Endpoint
async def api_system_stats(request):
    """
    Provides current CPU, memory, and disk usage statistics.
    """
    stats = {
        "cpu_percent": psutil.cpu_percent(interval=1),  # CPU usage percentage
        "memory_info": psutil.virtual_memory().percent,  # Memory usage percentage
        "disk_usage": psutil.disk_usage('/')._asdict(),  # Disk usage details (used, free, total)
    }
    return web.json_response(stats)

# Processes Endpoint
async def api_processes(request):
    """
    Lists active processes with details like PID, name, CPU usage, and memory usage.
    """
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "cpu": proc.info['cpu_percent'],
                "memory": proc.info['memory_info'].rss // (1024 * 1024),  # Convert memory from bytes to MB
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue  # Skip processes that are inaccessible
    return web.json_response(processes)

# System Logs Endpoint
async def api_system_logs(request):
    """
    Retrieves the last 50 lines from system logs. Provides mock logs if real logs are unavailable.
    """
    try:
        log_file = "/var/log/syslog" if os.path.exists("/var/log/syslog") else "/var/log/messages"
        if os.path.exists(log_file):
            logs = os.popen(f"tail -n 50 {log_file}").read().splitlines()  # Fetch last 50 lines
            return web.json_response(logs)

        # Provide mock data if real logs are not available
        return web.json_response([f"Log line {i}: Sample log entry" for i in range(1, 51)])
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

# System Uptime Endpoint
async def api_system_uptime(request):
    """
    Returns the system uptime in hours, minutes, and seconds format.
    """
    uptime_seconds = time.time() - psutil.boot_time()
    formatted_uptime = time.strftime("%H:%M:%S", time.gmtime(uptime_seconds))
    return web.json_response({"uptime": formatted_uptime})

# Logout Endpoint
async def api_logout(request):
    """
    Handles user logout by removing their session from the currently logged-in list.
    """
    try:
        data = await request.json()
        username = data.get("username")
        if username in CURRENT_LOGGED_USERS:
            del CURRENT_LOGGED_USERS[username]  # Remove the user from the logged-in list
            return web.json_response({"status": "success", "message": "Logout successful"})
        return web.json_response({"status": "failure", "message": "User not logged in"}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

def create_ssl_context():
    """Create SSL context for secure WebSocket connection."""
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    cert_file = pathlib.Path("/app/cert/localhost.crt")
    key_file = pathlib.Path("/app/cert/localhost.key")
    ssl_context.load_cert_chain(cert_file, key_file)
    return ssl_context

def run():
    """
    Sets up the web application, defines routes, and starts the server.
    """
    ssl_context = create_ssl_context()
    app = web.Application()
    app.add_routes([
        web.get("/", lambda _: web.HTTPFound("/frontend/login.html")),  # Redirect to login page
        web.get("/frontend/{subdir}/{filename}", serve_static),  # Serve static files
        web.get("/frontend/{filename}", serve_static),
        web.post("/api/login", api_login),  # Login endpoint
        web.post("/api/logout", api_logout),  # Logout endpoint
        web.get("/api/current_users", api_current_users),  # Current users endpoint
        web.get("/api/last_logged_users", api_last_logged_users),  # Last logged users endpoint
        web.get("/api/system_stats", api_system_stats),  # System stats endpoint
        web.get("/api/processes", api_processes),  # Processes endpoint
        web.get("/api/system_logs", api_system_logs),  # System logs endpoint
        web.get("/api/system_uptime", api_system_uptime),  # Uptime endpoint
    ])
    web.run_app(app, host="0.0.0.0", port=8765, ssl_context=ssl_context)  # Bind to all interfaces with SSL

if __name__ == "__main__":
    print("Server started at https://localhost:8765")
    run()

