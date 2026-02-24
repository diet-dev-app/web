// RegisterView.js
// Renders the registration view and handles registration UI events

export class RegisterView {
  constructor({ onRegister, onBackToLogin }) {
    this.onRegister = onRegister;
    this.onBackToLogin = onBackToLogin;
  }

  render(container) {
    container.innerHTML = `
      <div class="register-container card shadow-sm p-4 mx-auto my-5" style="max-width: 400px;">
        <h2 class="mb-3 text-center">Crear cuenta</h2>
        <form id="registerForm" autocomplete="off">
          <div class="mb-3">
            <label for="registerEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="registerEmail" required autocomplete="off" />
          </div>
          <div class="mb-3">
            <label for="registerEmailConfirm" class="form-label">Confirmar Email</label>
            <input type="email" class="form-control" id="registerEmailConfirm" required autocomplete="off" />
          </div>
          <div class="mb-3">
            <label for="registerPassword" class="form-label">Contraseña</label>
            <input type="password" class="form-control" id="registerPassword" required autocomplete="new-password" />
          </div>
          <div class="mb-3">
            <label for="registerPasswordConfirm" class="form-label">Confirmar Contraseña</label>
            <input type="password" class="form-control" id="registerPasswordConfirm" required autocomplete="new-password" />
          </div>
          <div class="mb-3">
            <label for="registerName" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="registerName" required />
          </div>
          <div class="mb-3 text-center">
            <div id="hcaptcha-register" class="mb-2"></div>
          </div>
          <button type="submit" class="btn btn-success w-100 mb-2">Registrarse</button>
        </form>
        <div class="text-center mt-3">
          <a href="#" id="backToLoginLink">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    `;
    // Load hCaptcha script if not present
    if (!window.hcaptcha) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Render hCaptcha widget
    const renderHCaptcha = () => {
      if (window.hcaptcha && document.getElementById('hcaptcha-register')) {
        window.hcaptcha.render('hcaptcha-register', {
          sitekey: '10000000-ffff-ffff-ffff-000000000001' // Demo sitekey, replace with your own for production
        });
      }
    };
    if (window.hcaptcha) {
      renderHCaptcha();
    } else {
      window.onload = () => setTimeout(renderHCaptcha, 500);
    }

    // Prevent copy/paste in confirmation fields
    const emailConfirm = container.querySelector('#registerEmailConfirm');
    const passwordConfirm = container.querySelector('#registerPasswordConfirm');
    [emailConfirm, passwordConfirm].forEach(input => {
      input.onpaste = input.oncopy = input.oncut = (e) => e.preventDefault();
    });

    container.querySelector('#registerForm').onsubmit = (e) => {
      e.preventDefault();
      const email = container.querySelector('#registerEmail').value.trim();
      const email2 = container.querySelector('#registerEmailConfirm').value.trim();
      const password = container.querySelector('#registerPassword').value;
      const password2 = container.querySelector('#registerPasswordConfirm').value;
      const name = container.querySelector('#registerName').value.trim();

      // Double validation
      if (!email || !email2 || !password || !password2 || !name) {
        this.showError?.("Todos los campos son obligatorios.");
        return;
      }
      if (email !== email2) {
        this.showError?.("Los emails no coinciden.");
        return;
      }
      if (password !== password2) {
        this.showError?.("Las contraseñas no coinciden.");
        return;
      }
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        this.showError?.("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
        return;
      }
      // hCaptcha validation
      let hcaptchaToken = null;
      try {
        hcaptchaToken = window.hcaptcha.getResponse(document.getElementById('hcaptcha-register'));
      } catch {}
      if (!hcaptchaToken) {
        this.showError?.("Por favor confirma que eres un humano (captcha).");
        return;
      }
      this.onRegister?.(email, password, name, hcaptchaToken);
    };
    container.querySelector('#backToLoginLink').onclick = (e) => {
      e.preventDefault();
      this.onBackToLogin?.();
    };
  }
}
