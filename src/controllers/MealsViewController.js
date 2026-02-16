import { MEALS } from "../data.js";
import { ApiService } from "../services/ApiService.js";

export class MealsViewController {
  constructor(state) {
    this.state = state;
    this.api = new ApiService();
  }

  async renderMealsView(container, highlightMealCallback) {
    // Fetch latest options from API
    let options = this.state.options;
    try {
      const apiOptions = await this.api.getMealOptions();
      if (Array.isArray(apiOptions)) {
        // Group by meal_time
        options = {};
        for (const opt of apiOptions) {
          const key = opt.meal_time?.name;
          if (!key) continue;
          if (!options[key]) options[key] = [];
          options[key].push({
            id: opt.id,
            name: opt.name,
            notes: opt.description,
            meal_time: opt.meal_time
          });
        }
      }
    } catch (e) {
      console.error('[MealsViewController] Error fetching options from API:', e);
    }

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
                  ${(options[m.key] || []).slice(0, 6).map(o => `<li>${this.escapeHtml(o.name)}${o.notes ? ' — ' + this.escapeHtml(o.notes) : ''}</li>`).join("") || "<li>\u2014</li>"}
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
