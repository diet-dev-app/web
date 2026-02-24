// Handles login view logic and authentication
import { LoginView } from "../views/LoginView.js";
import { ApiService } from "../services/ApiService.js";
import { RegisterController } from "./RegisterController.js";

export class LoginController {
  constructor() {
    this.loginViewContainer = document.getElementById("loginViewContainer");
    this.main = document.querySelector("main");
    this.nav = document.querySelector("nav");
    this.api = new ApiService();
    this.registerController = null;
    this.init();
  }

  isAuthenticated() {
    return !!localStorage.getItem("jwt_token");
  }

  showLoginView(successMsg = null) {
    this.loginViewContainer.classList.remove("d-none");
    if (this.main) this.main.style.display = "none";
    if (this.nav) this.nav.style.display = "none";
    new LoginView({
      onEmailLogin: (email, password) => this.handleEmailLogin(email, password),
      onGoogleLogin: () => this.handleGoogleLogin(),
      onRegister: () => this.showRegisterView()
    }).render(this.loginViewContainer);
    if (successMsg) {
      let alert = this.loginViewContainer.querySelector('.alert');
      if (!alert) {
        alert = document.createElement('div');
        alert.className = 'alert alert-success';
        this.loginViewContainer.prepend(alert);
      } else {
        alert.className = 'alert alert-success';
      }
      alert.textContent = successMsg;
    }
  }

  showApp() {
    this.loginViewContainer.classList.add("d-none");
    if (this.main) this.main.style.display = "";
    if (this.nav) this.nav.style.display = "";
  }

  async handleEmailLogin(email, password) {
    try {
      const result = await this.api.login(email, password);
      if (result.token) {
        localStorage.setItem("jwt_token", result.token);
        this.showApp();
        location.reload(); // reload to re-init app with auth
      } else {
        this.showError("Login failed: No token returned.");
      }
    } catch (err) {
      let msg = "Login failed.";
      if (err.data && err.data.message) msg = err.data.message;
      this.showError(msg);
    }
  }

  showError(message) {
    if (!this.loginViewContainer) return;
    let alert = this.loginViewContainer.querySelector('.alert');
    if (!alert) {
      alert = document.createElement('div');
      alert.className = 'alert alert-danger';
      this.loginViewContainer.prepend(alert);
    }
    alert.textContent = message;
  }

  handleGoogleLogin() {
    alert("Google login not implemented");
  }

  showRegisterView() {
    this.loginViewContainer.classList.add("d-none");
    if (!this.registerController) {
      this.registerController = new RegisterController({
        onRegisterSuccess: () => {
          this.hideRegisterView();
            this.showLoginView("Registro exitoso. Ahora puedes iniciar sesión.");
        },
        onBackToLogin: () => {
          this.hideRegisterView();
          this.showLoginView();
        }
      });
    } else {
      this.registerController.render();
    }
  }

  hideRegisterView() {
    if (this.registerController) this.registerController.hide();
  }

  init() {
    window.addEventListener("DOMContentLoaded", () => {
      if (!this.isAuthenticated()) {
        this.showLoginView();
      } else {
        this.showApp();
      }
    });
  }
}
