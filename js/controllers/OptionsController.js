// OptionsController.js
// Controller for rendering and managing meal options
import { MEALS, DEFAULT_OPTIONS } from "../data.js";
import { saveState } from "../storage.js";

export class OptionsController {
  constructor(state, setAlert) {
    this.state = state;
    this.setAlert = setAlert;
  }

  renderOptionsView(container) {
    container.innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="list-group" id="mealList">
            ${MEALS.map(m => `
              <button class="list-group-item list-group-item-action" data-meal="${m.key}">
                ${m.label}
              </button>`).join("")}
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
      const label = MEALS.find(x => x.key === selected)?.label || selected;
      optTitle.textContent = `Options — ${label}`;
      const list = this.state.options[selected] || [];
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

      optBody.querySelectorAll("[data-delopt]").forEach(b => b.addEventListener("click", () => {
        const i = Number(b.dataset.delopt);
        this.state.options[selected].splice(i, 1);
        saveState(this.state);
        draw();
      }));

      optBody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
        const i = Number(b.dataset.edit);
        const cur = this.state.options[selected][i];
        const name = prompt("Name", cur.name);
        if (!name) return;
        const notes = prompt("Notes (optional)", cur.notes || "") ?? cur.notes;
        this.state.options[selected][i] = { name: name.trim(), notes: (notes || "").trim() };
        saveState(this.state);
        draw();
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

    addOptBtn.addEventListener("click", () => {
      if (!selected) return this.setAlert("Select a meal first.", "warning");
      const name = prompt("Option name");
      if (!name) return;
      const notes = prompt("Notes (optional)") || "";
      this.state.options[selected].push({ name: name.trim(), notes: notes.trim() });
      saveState(this.state);
      draw();
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
