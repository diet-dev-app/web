// HelpController.js
// Controller for rendering the help view
import { HELP_TEXT, SHOPPING } from "../data.js";

export class HelpController {
  constructor(state) {
    this.state = state;
  }

  renderHelpView(container) {
    container.innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">Plan Guidelines</div>
            <div class="card-body">
              ${HELP_TEXT.map(line => `<div>${this.escapeHtml(line)}</div>`).join("")}
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header">Shopping List</div>
            <div class="card-body">
              <div class="fw-semibold">Proteins</div>
              <ul>${SHOPPING.proteinas.map(x => `<li>${this.escapeHtml(x)}</li>`).join("")}</ul>
              <div class="fw-semibold">Carbohydrates</div>
              <ul>${SHOPPING.carbohidratos.map(x => `<li>${this.escapeHtml(x)}</li>`).join("")}</ul>
              <div class="fw-semibold">Fats</div>
              <ul class="mb-0">${SHOPPING.grasas.map(x => `<li>${this.escapeHtml(x)}</li>`).join("")}</ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[c]);
  }
}
