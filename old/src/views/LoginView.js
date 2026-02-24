// LoginView.js
// Renders the login view and handles login UI events

export class LoginView {
  constructor({ onEmailLogin, onGoogleLogin, onRegister }) {
    this.onEmailLogin = onEmailLogin;
    this.onGoogleLogin = onGoogleLogin;
    this.onRegister = onRegister;
  }

  render(container) {
    container.innerHTML = `
      <div class="login-container card shadow-sm p-4 mx-auto my-5" style="max-width: 400px;">
        <h2 class="mb-3 text-center">Iniciar sesión</h2>
        <form id="loginForm">
          <div class="mb-3">
            <label for="loginEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="loginEmail" required />
          </div>
          <div class="mb-3">
            <label for="loginPassword" class="form-label">Contraseña</label>
            <input type="password" class="form-control" id="loginPassword" required />
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-2">Entrar</button>
        </form>
        <button id="googleLoginBtn" class="btn btn-outline-danger w-100 mb-2">
          <img src="assets/images/google-logo.svg" alt="Google" style="height:1em;vertical-align:middle;margin-right:8px;"> Iniciar sesión con Google
        </button>
        <div class="text-center mt-3">
          <a href="#" id="registerLink">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
    `;
    container.querySelector('#loginForm').onsubmit = (e) => {
      e.preventDefault();
      const email = container.querySelector('#loginEmail').value;
      const password = container.querySelector('#loginPassword').value;
      this.onEmailLogin?.(email, password);
    };
    container.querySelector('#googleLoginBtn').onclick = () => {
      this.onGoogleLogin?.();
    };
    container.querySelector('#registerLink').onclick = (e) => {
      e.preventDefault();
      this.onRegister?.();
    };
  }
}
