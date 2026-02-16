import { MEALS, DEFAULT_OPTIONS } from "../data.js";
import { saveState } from "../storage.js";
import { ApiService } from "../services/ApiService.js";

export class OptionsController {
  constructor(state, setAlert) {
    this.state = state;
    this.setAlert = setAlert;
    this.api = new ApiService();
  }

  async renderOptionsView(container) {
    // Fetch options from API and group by meal_time.name
    let apiOptions = [];
    try {
      apiOptions = await this.api.getMealOptions();
    } catch (e) {
      this.setAlert('Error loading options from server', 'danger');
      apiOptions = [];
    }
    // Group by meal_time.name
    const grouped = {};
    for (const opt of apiOptions) {
      const key = opt.meal_time?.name;
      if (!key) continue;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        id: opt.id,
        name: opt.name,
        notes: opt.description,
        meal_time: opt.meal_time
      });
    }
    this.state.options = grouped;
    saveState(this.state);

    // Only show meals with options
    const mealsWithOptions = Object.keys(grouped);
    container.innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="list-group" id="mealList">
            ${mealsWithOptions.map(key => {
              const label = grouped[key][0]?.meal_time?.label || key;
              return `<button class="list-group-item list-group-item-action" data-meal="${key}">${label}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span id="optTitle">Options</span>
              <button id="addOptBtn" class="btn btn-sm btn-primary">Add</button>
            </div>
            <div class="card-body">
              <div id="optBody" class="small-muted">Choose a meal on the left.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const mealList = container.querySelector("#mealList");
    const optTitle = container.querySelector("#optTitle");
    const optBody = container.querySelector("#optBody");
    const addOptBtn = container.querySelector("#addOptBtn");

    let selected = null;

    const draw = () => {
      if (!selected) return;
      const label = grouped[selected]?.[0]?.meal_time?.label || selected;
      optTitle.textContent = `Options — ${label}`;
      const list = grouped[selected] || [];
      optBody.innerHTML = list.length ? `
        <div class="list-group">
          ${list.map((o, i) => `
            <div class="list-group-item d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">${this.escapeHtml(o.name)}</div>
                <div class="small-muted">${this.escapeHtml(o.notes || "")}</div>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" data-edit="${i}">Edit</button>
                <button class="btn btn-outline-danger" data-delopt="${i}">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="text-secondary">No options. Add one.</div>`;

      optBody.querySelectorAll("[data-delopt]").forEach(b => b.addEventListener("click", async () => {
        const i = Number(b.dataset.delopt);
        const removed = grouped[selected].splice(i, 1)[0];
        saveState(this.state);
        draw();
        // Sync with API
        try {
          await this.api.deleteMealOption(selected, removed.id || i);
        } catch (e) {
          console.error('[OptionsController] Error deleting option:', e);
        }
      }));

      optBody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", async () => {
        const i = Number(b.dataset.edit);
        const cur = grouped[selected][i];
        const name = prompt("Name", cur.name);
        if (!name) return;
        const notes = prompt("Notes (optional)", cur.notes || "") ?? cur.notes;
        const updated = { ...cur, name: name.trim(), notes: (notes || "").trim() };
        grouped[selected][i] = updated;
        saveState(this.state);
        draw();
        // Sync with API
        try {
          await this.api.updateMealOption(selected, updated.id || i, updated);
        } catch (e) {
          console.error('[OptionsController] Error updating option:', e);
        }
      }));
    };

    mealList.querySelectorAll("[data-meal]").forEach(btn => {
      btn.addEventListener("click", () => {
        selected = btn.dataset.meal;
        mealList.querySelectorAll(".active").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        draw();
      });
    });

    addOptBtn.addEventListener("click", async () => {
      if (!selected) return this.setAlert("Select a meal first.", "warning");
      const name = prompt("Option name");
      if (!name) return;
      const notes = prompt("Notes (optional)") || "";
      const newOpt = { name: name.trim(), notes: notes.trim() };
      if (!grouped[selected]) grouped[selected] = [];
      grouped[selected].push(newOpt);
      saveState(this.state);
      draw();
      // Sync with API
      try {
        await this.api.addMealOption(selected, newOpt);
      } catch (e) {
        console.error('[OptionsController] Error adding option:', e);
      }
    });

    // Allow highlight from meals view
    window.__highlightMeal = (mealKey) => {
      const btn = mealList.querySelector(`[data-meal="${mealKey}"]`);
      btn?.click();
    };
  }

  highlightMeal(mealKey) {
    window.__highlightMeal?.(mealKey);
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[c]);
  }
}
