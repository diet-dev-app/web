import { LoginController } from "./controllers/LoginController.js";

function showUserDropdown() {
	const dropdown = document.getElementById("userDropdownContainer");
	const nameSpan = document.getElementById("userDropdownName");
	let user = null;
	try {
		user = JSON.parse(localStorage.getItem("user"));
	} catch {}
	if (user && user.name) {
		nameSpan.textContent = user.name;
	} else {
		nameSpan.textContent = "Usuario";
	}
	dropdown.style.display = "block";
}

function hideUserDropdown() {
	const dropdown = document.getElementById("userDropdownContainer");
	dropdown.style.display = "none";
}

function setupUserDropdownEvents() {
	const logoutBtn = document.getElementById("logoutOption");
	if (logoutBtn) {
		logoutBtn.onclick = (e) => {
			e.preventDefault();
			localStorage.removeItem("jwt_token");
			localStorage.removeItem("user");
			location.reload();
		};
	}
	// Profile option can be implemented in the future
}

window.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("jwt_token")) {
		showUserDropdown();
		setupUserDropdownEvents();
	} else {
		hideUserDropdown();
	}
});

// Instantiate the LoginController to handle login view logic
new LoginController();
