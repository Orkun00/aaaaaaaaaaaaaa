# CS-395 Project: System Monitor Application

This project provides a **System Monitor Application** that allows users to monitor CPU, memory, and disk usage, manage logged-in users, view system processes, and inspect system logs through a secure web-based interface. The application is developed using **Python (aiohttp)** for the backend and **HTML/CSS/JavaScript** for the frontend. It is containerized using **Docker**, making it deployable as a service on any platform.

---

### Table of Contents

1. [Features](#features)  
2. [Setup and Running](#setup-and-running)  
3. [Docker Deployment](#docker-deployment)  
   - [Accessing the Application](#accessing-the-application)    
4. [Tech Stack](#tech-stack)
5. [Exposed Ports](#exposed-ports)   
6. [License](#license)  

---

## Features

- **Secure Login:** Fixed credentials for 5 users, with login/logout tracking.
- **System Monitoring:**
  - CPU, memory, and disk usage statistics.
  - Current and last 10 logged-in users.
  - System uptime.
  - Active processes (PID, CPU, memory usage).
  - System logs (last 50 entries).
- **Dynamic Updates:** Real-time updates every few seconds using RESTful APIs.
- **Containerized Deployment:** Fully Dockerized for easy setup and scalability.
- **Dynamic Port Mapping:** Maps your Linux user ID as the port for isolation and ease of deployment.
- **HTTPS Support:** Secure communication via SSL/TLS certificates.

---

## Setup and Running

### 1. Prerequisites

Ensure the following are installed on your system:

- **Docker**: For containerization.
- **Docker Compose**: For managing multi-container applications.
- **Git**: To clone the repository.

---

### 2. Clone the Repository

```bash
git clone <repository-url>
cd cs-395-project

```
---

## Docker Deployment

### 1. Build and Run the Application

To run the application as a background service, follow these steps:

1. **Determine your Linux user ID**:
   ```bash
   id -u
   
   ```
For example, if your user ID is 1001, this will be used as the port number.

2. **Build the Dockerized Application**:
   ```bash
   USER_ID=$(id -u) docker compose build

   ```

2. **Start the application using Docker Compose**:
   ```bash
   USER_ID=$(id -u) docker compose up -d

   ```
This will map your user ID as the external port for the container. For instance, if your user ID is 1001, the application will be accessible at:

   ```bash
   https://cs395.org/1001/frontend/login.html

   ```

---

### 2. Accessing the Application

- **Login Page**: `https://cs395.org/<your Linux user id>/frontend/login.html`
- **Dashboard**: Automatically redirects upon successful login.

For example, if your Linux user ID is `1001`, access the application at:

   ```bash
   https://cs395.org/1001/frontend/login.html

   ```

---

### 3. Stopping the Application

To stop the application and remove the container, use:

   ```bash
   docker compose down

   ```

---

## Tech Stack

- **Backend**: Python (aiohttp, psutil)
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker, Docker Compose
- **Secure Communication**: SSL/TLS Certificates

---

## Exposed Ports

- **Container Port**: `8765` (internal)
- **Host Port**: `<Linux user ID>` (dynamic)

The dynamic port mapping ensures that each user's application runs on a unique port, corresponding to their Linux user ID.

---

## License

This project is licensed under the [MIT License](LICENSE).
