import { RegisterView } from "../views/RegisterView.js";
import { ApiService } from "../services/ApiService.js";

export class RegisterController {
  constructor({ onRegisterSuccess, onBackToLogin }) {
    this.api = new ApiService();
    this.container = document.getElementById("registerViewContainer");
    this.onRegisterSuccess = onRegisterSuccess;
    this.onBackToLogin = onBackToLogin;
    this.render();
  }

  async handleRegister(email, password, name, hcaptchaToken) {
    try {
      const result = await this.api.request(this.api.constructor.API_ROUTES?.REGISTER || "/api/register", {
        method: "POST",
        body: { email, password, name, hcaptchaToken }
      });
      // Registration success: redirect to login with message
      this.showSuccess("Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => {
        this.onRegisterSuccess?.();
      }, 1200);
    } catch (err) {
      let msg = "Registration failed.";
      if (err.data && err.data.message) msg = err.data.message;
      this.showError(msg);
    }
  }

  showSuccess(message) {
    if (!this.container) return;
    let alert = this.container.querySelector('.alert');
    if (!alert) {
      alert = document.createElement('div');
      alert.className = 'alert alert-success';
      this.container.prepend(alert);
    } else {
      alert.className = 'alert alert-success';
    }
    alert.textContent = message;
  }

  showError(message) {
    if (!this.container) return;
    let alert = this.container.querySelector('.alert');
    if (!alert) {
      alert = document.createElement('div');
      alert.className = 'alert alert-danger';
      this.container.prepend(alert);
    }
    alert.textContent = message;
  }

  render() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = "registerViewContainer";
      document.body.appendChild(this.container);
    }
    this.container.classList.remove("d-none");
    new RegisterView({
      onRegister: (email, password, name, hcaptchaToken) => this.handleRegister(email, password, name, hcaptchaToken),
      onBackToLogin: () => this.onBackToLogin?.()
    }).render(this.container);
  }

  hide() {
    if (this.container) this.container.classList.add("d-none");
  }
}
