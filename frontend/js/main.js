document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const statsContent = document.getElementById("stats-content"); // Container for system stats
  const usersList = document.getElementById("users-list"); // List of current logged-in users
  const processesTable = document.getElementById("processes-table").querySelector("tbody"); // Table body for processes
  const processSummary = document.getElementById("process-summary"); // Summary for process stats
  const logList = document.getElementById("log-list"); // List for system logs
  const lastUsersList = document.getElementById("last-users-list"); // List for last 10 logged-in users
  const uptimeDisplay = document.getElementById("uptime-content"); // Display for system uptime

  // Fetch and populate system stats
  async function fetchSystemStats() {
    try {
      const response = await fetch("/api/system_stats"); // Fetch system stats from the server
      const stats = await response.json();
      statsContent.innerHTML = `
        <div><strong>CPU Usage:</strong> ${stats.cpu_percent}%</div>
        <div><strong>Memory Usage:</strong> ${stats.memory_info}%</div>
        <div><strong>Disk Usage:</strong> ${stats.disk_usage.used / (1024 * 1024)} MB / ${stats.disk_usage.total / (1024 * 1024)} MB</div>
      `;
    } catch (error) {
      console.error("Failed to fetch system stats:", error); // Log errors to the console
    }
  }

  // Fetch and populate current logged-in users
  async function fetchCurrentUsers() {
    try {
      const response = await fetch("/api/current_users"); // Fetch current users from the server
      const users = await response.json();
      usersList.innerHTML = users.map(user => `<li>${user.username} (${user.login_time})</li>`).join(""); 
    } catch (error) {
      console.error("Failed to fetch current users:", error);
    }
  }

  // Fetch and populate processes
  async function fetchProcesses() {
    try {
      const response = await fetch("/api/processes"); // Fetch process data from the server
      const processes = await response.json();

      processesTable.innerHTML = processes
        .map(
          (process) => `
          <tr>
            <td>${process.pid}</td>
            <td>${process.name}</td>
            <td>${process.cpu}%</td>
            <td>${process.memory} MB</td>
          </tr>
        `
        )
        .join(""); // Populate the processes table

      // Update summary
      const totalCPU = processes.reduce((sum, proc) => sum + proc.cpu, 0);
      const totalMemory = processes.reduce((sum, proc) => sum + proc.memory, 0);
      processSummary.innerText = `Total Processes: ${processes.length}, Total CPU: ${totalCPU}%, Total Memory: ${totalMemory} MB`;
    } catch (error) {
      console.error("Failed to fetch processes:", error);
    }
  }

  // Fetch and populate system logs
  async function fetchSystemLogs() {
    try {
      const response = await fetch("/api/system_logs"); // Fetch the last 50 system logs
      const logs = await response.json();
      logList.innerHTML = logs.map((log) => `<li>${log}</li>`).join(""); // Populate the log list
    } catch (error) {
      console.error("Failed to fetch system logs:", error);
    }
  }

  // Fetch and populate last logged-in users
  async function fetchLastLoggedUsers() {
    try {
      const response = await fetch("/api/last_logged_users"); // Fetch the last 10 logged-in users
      const users = await response.json();
      lastUsersList.innerHTML = users
        .map(
          (user) =>
            `<li>${user.username} (IP: ${user.ip_address}, Logged in at: ${user.login_time})</li>`
        )
        .join(""); // Display user login history
    } catch (error) {
      console.error("Failed to fetch last logged-in users:", error);
    }
  }

  // Fetch and update system uptime
  async function fetchSystemUptime() {
    try {
      const response = await fetch("/api/system_uptime"); // Fetch system uptime
      const data = await response.json();
      uptimeDisplay.innerText = `System Uptime: ${data.uptime}`; // Display uptime
    } catch (error) {
      console.error("Failed to fetch uptime:", error);
    }
  }

  // Sorting functionality for processes table
  let sortOrder = { pid: true, name: true, cpu: true, memory: true }; // Keep track of ascending/descending order

  function sortProcesses(key) {
    fetch("/api/processes")
      .then((response) => response.json())
      .then((processes) => {
        // Sort processes based on the selected key
        processes.sort((a, b) => {
          if (key === "name") {
            return sortOrder[key]
              ? a[key].localeCompare(b[key]) // Ascending
              : b[key].localeCompare(a[key]); // Descending
          }
          return sortOrder[key] ? a[key] - b[key] : b[key] - a[key]; // Numeric sorting
        });

        // Toggle sorting order for the next click
        sortOrder[key] = !sortOrder[key];

        // Re-render the sorted processes table
        processesTable.innerHTML = processes
          .map(
            (process) => `
            <tr>
              <td>${process.pid}</td>
              <td>${process.name}</td>
              <td>${process.cpu}%</td>
              <td>${process.memory} MB</td>
            </tr>
          `
          )
          .join("");
      })
      .catch((error) => console.error("Failed to sort processes:", error));
  }

  // Attach event listeners to sorting buttons
  document.getElementById("sort-pid").addEventListener("click", () => sortProcesses("pid"));
  document.getElementById("sort-name").addEventListener("click", () => sortProcesses("name"));
  document.getElementById("sort-cpu").addEventListener("click", () => sortProcesses("cpu"));
  document.getElementById("sort-memory").addEventListener("click", () => sortProcesses("memory"));

  // Logout button functionality
  document
    .getElementById("logout-button")
    .addEventListener("click", async function () {
      try {
        const username = localStorage.getItem("username"); // Retrieve username from local storage
        await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }), // Send logout request to the server
        });
        localStorage.removeItem("username"); // Clear username from local storage
        window.location.href = "login.html"; // Redirect to login page
      } catch (error) {
        console.error("Logout failed:", error); // Log errors to the console
      }
    });

  // Periodic updates for all data (set intervals for each fetch operation)
  setInterval(fetchSystemStats, 3000); // Update system stats every 3 seconds
  setInterval(fetchProcesses, 5000); // Update process list every 5 seconds
  setInterval(fetchSystemLogs, 30000); // Update system logs every 30 seconds
  setInterval(fetchCurrentUsers, 5000); // Update logged-in users every 5 seconds
  setInterval(fetchLastLoggedUsers, 10000); // Update last logged-in users every 10 seconds
  setInterval(fetchSystemUptime, 1000); // Update uptime every second

  // Initial fetch for all data
  fetchSystemStats();
  fetchCurrentUsers();
  fetchProcesses();
  fetchSystemLogs();
  fetchLastLoggedUsers();
  fetchSystemUptime();
});
