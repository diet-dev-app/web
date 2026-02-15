// MealsViewController.js
// Controller for rendering the meals view
import { MEALS } from "../data.js";

export class MealsViewController {
  constructor(state) {
    this.state = state;
  }

  renderMealsView(container, highlightMealCallback) {
    container.innerHTML = `
      <div class="row g-3">
        ${MEALS.map(m => `
          <div class="col-12 col-lg-6">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>${m.label}</span>
                <button class="btn btn-sm btn-outline-primary" data-browse="${m.key}">View options</button>
              </div>
              <div class="card-body">
                <div class="small-muted mb-2">Available options (editable):</div>
                <ul class="mb-0">
                  ${(this.state.options[m.key] || []).slice(0, 6).map(o => `<li>${this.escapeHtml(o.name)}</li>`).join("") || "<li>—</li>"}
                </ul>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
    container.querySelectorAll("[data-browse]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (highlightMealCallback) highlightMealCallback(btn.dataset.browse);
      });
    });
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[c]);
  }
}
