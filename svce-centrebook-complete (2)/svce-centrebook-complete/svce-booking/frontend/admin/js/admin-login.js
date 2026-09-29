const API_BASE_URL = "http://localhost:8080";

const loginForm = document.getElementById("adminLoginForm");
const adminId = document.getElementById("adminId");
const adminPassword = document.getElementById("adminPassword");
const adminLoginMessage = document.getElementById("adminLoginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = adminId.value.trim();
    const password = adminPassword.value.trim();

    if (!username || !password) {
        adminLoginMessage.textContent = "Please enter username and password.";
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (response.ok && data.success) {

            sessionStorage.setItem("adminLoggedIn", "true");

            window.location.href = "admin-dashboard.html";

        } else {

            adminLoginMessage.textContent =
                data.message || "Invalid username or password.";

        }

    } catch (error) {

        console.error("Login error:", error);

        adminLoginMessage.textContent =
            "Unable to connect to server.";

    }
});