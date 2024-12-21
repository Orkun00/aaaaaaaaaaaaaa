// Attach event listener to the login form for the "submit" event
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Retrieve the username and password input values
    const usernameInput = document.getElementById("username").value; // User's input for username
    const passwordInput = document.getElementById("password").value; // User's input for password

    try {
        // Send a POST request to the login API with username and password
        const response = await fetch("/api/login", {
            method: "POST", // HTTP method
            headers: { "Content-Type": "application/json" }, // Specify JSON content
            body: JSON.stringify({ username: usernameInput, password: passwordInput }), // Send credentials as JSON
        });

        const data = await response.json(); // Parse the server response

        if (response.ok) {
            // If login is successful
            localStorage.setItem("authenticated", "true"); // Store an authentication flag in localStorage
            window.location.href = "dashboard.html"; // Redirect to the dashboard page
        } else {
            // If login fails, display an error message
            const errorDiv = document.getElementById("error-message"); // Select the error message div
            errorDiv.innerText = data.message || "Invalid username or password. Please try again."; // Set the error message
            errorDiv.style.display = "block"; // Make the error message visible
        }
    } catch (error) {
        // Handle unexpected errors (e.g., server is down or unreachable)
        console.error("Error during login:", error); // Log the error to the console
        const errorDiv = document.getElementById("error-message"); // Select the error message div
        errorDiv.innerText = "Failed to connect to the server. Please try again later."; // Set a generic error message
        errorDiv.style.display = "block"; // Make the error message visible
    }
});
