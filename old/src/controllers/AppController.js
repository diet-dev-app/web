// AppController.js
// Main application controller

import { HELP_TEXT, SHOPPING, DEFAULT_OPTIONS, MEALS } from "../data.js";
import { loadState, saveState, resetAll, exportJSON, importJSON } from "../storage.js";
import { ApiService } from "../services/ApiService.js";
import { MealAdder } from "../MealAdder.js";
import { ReusableModal } from "../ReusableModal.js";
import { MealController } from "./MealController.js";
import { RouteController } from "./RouteController.js";
import { HelpController } from "./HelpController.js";
import { MealsViewController } from "./MealsViewController.js";
import { OptionsController } from "./OptionsController.js";

export class AppController {
  constructor() {
    console.log('[AppController] Constructor called');
    this.api = new ApiService();
    this.state = loadState();
    this.initFromApi();
    // Patch: always sync state with API after local changes
    this.syncStateToApi = async () => {
      try {
        // Save log and notes to API (if endpoint exists)
        if (this.api && this.state.log) {
          await this.api.addMeal({ log: this.state.log, notes: this.state.notes });
        }
      } catch (e) {
        console.error('[AppController] Error syncing state to API:', e);
      }
    };

    this.el = (id) => document.getElementById(id);
    this.views = ["calendar", "table", "meals", "help", "options"].reduce((acc, v) => {
      acc[v] = this.el(`view-${v}`);
      return acc;
    }, {});
    this.monthPicker = this.el("monthPicker");
    this.viewSelect = this.el("viewSelect");
    this.subtitle = this.el("subtitle");
    this.alerts = this.el("alerts");
    this.dayModal = new bootstrap.Modal(this.el("dayModal"));
    this.dayEditor = this.el("dayEditor");
    this.dayModalTitle = this.el("dayModalTitle");
    this.saveDayBtn = this.el("saveDayBtn");
    this.dayModalFooter = this.el("dayModal").querySelector(".modal-footer");
    this.reusableDayModal = new ReusableModal(this.el("dayModal"));
    this.mealAdderModal = new ReusableModal(this.el("mealAdderModal"), {
      titleEl: this.el("mealAdderModalTitle"),
      bodyEl: this.el("mealAdderModalBody"),
      footerEl: this.el("mealAdderModalFooter")
    });
    this.mealAdder = new MealAdder(this.mealAdderModal);
    this.mealController = new MealController(this.state);
    this.currentMonth = new Date();
    this.currentMonth.setDate(1);
    this.editingDate = null;
    this.helpController = new HelpController(this.state);
    this.mealsViewController = new MealsViewController(this.state);
    this.optionsController = new OptionsController(this.state, this.setAlert.bind(this));
    this.switchView('calendar');
    console.log('[AppController] switchView(calendar) called');
    this.routeController = new RouteController(this);
    if (this.viewSelect) {
      this.viewSelect.addEventListener("change", () => {
        const view = this.viewSelect.value;
        console.log(`[AppController] viewSelect changed to: ${view}`);
        this.routeController.setHash(view);
        this.switchView(view);
      });
    }
  }

  async initFromApi() {
    try {
      // Load meal options from API
      const options = await this.api.getMealOptions();
      if (options) {
        this.state.options = options;
        saveState(this.state);
      }
      // Load meals (log) from API
      const meals = await this.api.getMeals();
      if (meals) {
        this.state.log = meals.log || {};
        this.state.notes = meals.notes || {};
        saveState(this.state);
      }
      // Optionally, re-render current view after loading
      this.render(this.routeController?.getCurrentView?.() || 'calendar');
    } catch (e) {
      this.setAlert('Error loading data from server', 'danger');
      console.error('[AppController] API load error:', e);
    }
  }

  ymd(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  parseMonthValue(v) {
    const [y, m] = v.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  setAlert(msg, type = "secondary") {
    this.alerts.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>`;
  }

  switchView(name) {
    console.log(`[AppController] switchView(${name})`);
    Object.entries(this.views).forEach(([k, node]) => node.classList.toggle("d-none", k !== name));
    this.render(name);
  }

  render(name) {
    console.log(`[AppController] render(${name})`);
    this.subtitle.textContent = `${this.currentMonth.getFullYear()}-${String(this.currentMonth.getMonth() + 1).padStart(2, "0")}`;
    if (name === "calendar") this.renderCalendar();
    if (name === "table") this.renderTable();
    if (name === "meals") this.renderMealsView();
    if (name === "help") this.renderHelp();
    if (name === "options") this.renderOptions();
  }

  // Meals view rendering using MealsViewController
  renderMealsView() {
    if (!this.views.meals) return;
    this.mealsViewController.renderMealsView(this.views.meals, (mealKey) => {
      this.viewSelect.value = "options";
      this.switchView("options");
      setTimeout(() => this.optionsController.highlightMeal(mealKey), 0);
    });
  }

  // Help view rendering using HelpController
  renderHelp() {
    if (!this.views.help) return;
    this.helpController.renderHelpView(this.views.help);
  }

  // Options view rendering using OptionsController
  renderOptions() {
    if (!this.views.options) return;
    this.optionsController.renderOptionsView(this.views.options);
  }

  // Stub for table view rendering
  renderTable() {
    if (!this.views.table) return;
    this.views.table.innerHTML = `<div class="alert alert-info">Table view coming soon.</div>`;
  }

  renderCalendar() {
    console.log('[AppController] renderCalendar() called');
    const d = new Date(this.currentMonth);
    const year = d.getFullYear();
    const month = d.getMonth();

    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdays = ["L", "M", "X", "J", "V", "S", "D"].map(w => `<div class="text-center small text-secondary">${w}</div>`).join("");

    let cells = "";
    for (let i = 0; i < startDay; i++) cells += `<div></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.ymd(new Date(year, month, day));
      const log = this.state.log[dateStr];
      const count = log ? Object.values(log).reduce((a, arr) => a + (arr?.length || 0), 0) : 0;
      cells += `
        <div class="day-cell" data-date="${dateStr}">
          <div class="d-flex justify-content-between align-items-center">
            <div class="day-num">${day}</div>
            ${count ? `<span class="badge text-bg-primary badge-meal">${count}</span>` : `<span class="small-muted">—</span>`}
          </div>
          <div class="mt-2 small-muted">${this.state.notes[dateStr] ? "Con notas" : ""}</div>
        </div>`;
    }

    this.views.calendar.innerHTML = `
      <div class="mb-2 small-muted">Click en un día para registrar comidas.</div>
      <div class="calendar-grid mb-2">${weekdays}</div>
      <div class="calendar-grid">${cells}</div>
    `;

    this.views.calendar.querySelectorAll("[data-date]").forEach(node => {
      node.addEventListener("click", () => this.openDay(node.dataset.date));
    });
  }

  getDayLog(dateStr) {
    if (!this.state.log[dateStr]) this.state.log[dateStr] = { desayuno: [], comida: [], merienda: [], cena: [] };
    return this.state.log[dateStr];
  }

  openDay(dateStr) {
    this.editingDate = dateStr;
    this.dayModalTitle.textContent = `Día ${dateStr}`;
    const log = this.getDayLog(dateStr);
    this.dayEditor.innerHTML = `
      <div class="col-12">
        <label class="form-label">Notas (opcional)</label>
        <textarea id="dayNotes" class="form-control" rows="2" placeholder="Ej.: hambre, entrenamiento, ajustes...">${this.state.notes[dateStr] || ""}</textarea>
      </div>
      ${MEALS.map(m => `
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
              <span>${m.label}</span>
              <button class="btn btn-sm btn-outline-primary" data-add="${m.key}">Add</button>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2" id="chips-${m.key}">
                ${(log[m.key] || []).map((item, idx) => `
                  <span class="badge text-bg-dark">
                    ${item}
                    <button class="btn btn-sm btn-link link-light p-0 ms-2" data-del="${m.key}" data-idx="${idx}" aria-label="Delete">×</button>
                  </span>
                `).join("") || `<span class="small-muted">No record</span>`}
              </div>
            </div>
          </div>
        </div>
      `).join("")}
    `;
    this.dayEditor.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const meal = btn.dataset.add;
        let choices = [];
        try {
          const opts = await this.api.getMealOptions();
          // opts is now an array, group by meal_time
          if (Array.isArray(opts)) {
            choices = opts.filter(o => o.meal_time && o.meal_time.name === meal).map(o => ({
              id: o.id,
              name: o.name,
              notes: o.description,
              meal_time: o.meal_time
            }));
          } else if (opts && opts[meal]) {
            choices = opts[meal];
          } else {
            choices = this.state.options[meal] || [];
          }
        } catch (e) {
          choices = this.state.options[meal] || [];
        }
        this.mealAdder.show(dateStr, meal, choices, (selectedOption) => {
          console.log(selectedOption);
          this.mealController.addMeal(dateStr, meal, selectedOption);
          const chipsDiv = this.dayEditor.querySelector(`#chips-${meal}`);
          if (chipsDiv) {
            chipsDiv.innerHTML = (this.state.log[dateStr][meal] || []).map((item, idx) => `
              <span class="badge text-bg-dark">
                ${item.name}
                <button class="btn btn-sm btn-link link-light p-0 ms-2" data-del="${meal}" data-idx="${idx}" aria-label="Delete">×</button>
              </span>
            `).join("") || `<span class="small-muted">No record</span>`;
            chipsDiv.querySelectorAll("[data-del]").forEach(delBtn => {
              delBtn.addEventListener("click", () => {
                console.log(`Delete clicked for meal: ${meal}, idx: ${selectedOption.id}`);
                const idx = Number(delBtn.dataset.idx);
                this.mealController.removeMeal(dateStr, meal, idx);
                chipsDiv.innerHTML = (this.state.log[dateStr][meal] || []).map((item, idx) => `
                  <span class="badge text-bg-dark">
                    ${item}
                    <button class="btn btn-sm btn-link link-light p-0 ms-2" data-del="${meal}" data-idx="${idx}" aria-label="Delete">×</button>
                  </span>
                `).join("") || `<span class="small-muted">No record</span>`;
                chipsDiv.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", delBtn.onclick));
              });
            });
          }
          this.setAlert(`Opción agregada a ${meal}.`, "success");
        });
      });
    });
    this.dayEditor.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const meal = btn.dataset.del;
        const idx = Number(btn.dataset.idx);
        this.getDayLog(dateStr)[meal].splice(idx, 1);
        saveState(this.state);
        this.openDay(dateStr);
      });
    });
    this.reusableDayModal.show();
  }
}
