import { HELP_TEXT, SHOPPING, DEFAULT_OPTIONS, MEALS } from "./data.js";
import { loadState, saveState, resetAll, exportJSON, importJSON } from "./storage.js";

// Carga o inicializa el estado.
let state = loadState();
if (!state.options) {
  // Copia profunda de DEFAULT_OPTIONS para evitar modificaciones inadvertidas.
  state.options = structuredClone(DEFAULT_OPTIONS);
  saveState(state);
}

// Helpers para acceder a elementos del DOM.
const el = (id) => document.getElementById(id);

// Registra cada vista en el objeto views.
const views = ["calendar", "table", "meals", "help", "options"].reduce((acc, v) => {
  acc[v] = el(`view-${v}`);
  return acc;
}, {});

const monthPicker = el("monthPicker");
const viewSelect = el("viewSelect");
const subtitle = el("subtitle");
const alerts = el("alerts");

const dayModal = new bootstrap.Modal(el("dayModal"));
const dayEditor = el("dayEditor");
const dayModalTitle = el("dayModalTitle");
const saveDayBtn = el("saveDayBtn");

let currentMonth = new Date();
currentMonth.setDate(1);
let editingDate = null;

// Formatea un Date como YYYY-MM-DD.
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Convierte el valor del picker de mes a Date.
function parseMonthValue(v) {
  const [y, m] = v.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// Muestra una alerta bootstrap.
function setAlert(msg, type = "secondary") {
  alerts.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
}

// Cambia de vista y vuelve a renderizar.
function switchView(name) {
  Object.entries(views).forEach(([k, node]) => node.classList.toggle("d-none", k !== name));
  render(name);
}

// Renderiza según la vista actual.
function render(name) {
  subtitle.textContent = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  if (name === "calendar") renderCalendar();
  if (name === "table") renderTable();
  if (name === "meals") renderMealsView();
  if (name === "help") renderHelp();
  if (name === "options") renderOptions();
}

// Obtiene el registro de un día, inicializa si no existe.
function getDayLog(dateStr) {
  if (!state.log[dateStr]) state.log[dateStr] = { desayuno: [], comida: [], merienda: [], cena: [] };
  return state.log[dateStr];
}

// Abre el modal para editar un día concreto.
function openDay(dateStr) {
  editingDate = dateStr;
  dayModalTitle.textContent = `Día ${dateStr}`;
  const log = getDayLog(dateStr);

  dayEditor.innerHTML = `
    <div class="col-12">
      <label class="form-label">Notas (opcional)</label>
      <textarea id="dayNotes" class="form-control" rows="2" placeholder="Ej.: hambre, entrenamiento, ajustes...">${state.notes[dateStr] || ""}</textarea>
    </div>
    ${MEALS.map(m => `
      <div class="col-12 col-lg-6">
        <div class="card">
          <div class="card-header d-flex align-items-center justify-content-between">
            <span>${m.label}</span>
            <button class="btn btn-sm btn-outline-primary" data-add="${m.key}">Añadir</button>
          </div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2" id="chips-${m.key}">
              ${(log[m.key] || []).map((item, idx) => `
                <span class="badge text-bg-dark">
                  ${item}
                  <button class="btn btn-sm btn-link link-light p-0 ms-2" data-del="${m.key}" data-idx="${idx}" aria-label="Borrar">×</button>
                </span>
              `).join("") || `<span class="small-muted">Sin registro</span>`}
            </div>
          </div>
        </div>
      </div>
    `).join("")}
  `;

  // Botón añadir: prompt al usuario para seleccionar una opción.
  dayEditor.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.add;
      const choices = state.options[meal] || [];
      const pick = prompt(
        `Añadir a ${meal}. Escribe el nombre exacto o usa uno de estos:\n\n` +
        choices.map(o => `- ${o.name}`).join("\n")
      );
      if (!pick) return;
      getDayLog(dateStr)[meal].push(pick.trim());
      saveState(state);
      openDay(dateStr);
    });
  });

  // Botón borrar: elimina una opción del log.
  dayEditor.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.del;
      const idx = Number(btn.dataset.idx);
      getDayLog(dateStr)[meal].splice(idx, 1);
      saveState(state);
      openDay(dateStr);
    });
  });

  dayModal.show();
}

// Guardar cambios en el modal.
saveDayBtn.addEventListener("click", () => {
  if (!editingDate) return;
  state.notes[editingDate] = (el("dayNotes")?.value || "").trim();
  saveState(state);
  dayModal.hide();
  render(viewSelect.value);
  setAlert("Guardado.", "success");
});

// Renderiza el calendario mensual.
function renderCalendar() {
  const d = new Date(currentMonth);
  const year = d.getFullYear();
  const month = d.getMonth();

  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ["L", "M", "X", "J", "V", "S", "D"].map(w => `<div class="text-center small text-secondary">${w}</div>`).join("");

  let cells = "";
  for (let i = 0; i < startDay; i++) cells += `<div></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = ymd(new Date(year, month, day));
    const log = state.log[dateStr];
    const count = log ? Object.values(log).reduce((a, arr) => a + (arr?.length || 0), 0) : 0;
    cells += `
      <div class="day-cell" data-date="${dateStr}">
        <div class="d-flex justify-content-between align-items-center">
          <div class="day-num">${day}</div>
          ${count ? `<span class="badge text-bg-primary badge-meal">${count}</span>` : `<span class="small-muted">—</span>`}
        </div>
        <div class="mt-2 small-muted">${state.notes[dateStr] ? "Con notas" : ""}</div>
      </div>`;
  }

  views.calendar.innerHTML = `
    <div class="mb-2 small-muted">Click en un día para registrar comidas.</div>
    <div class="calendar-grid mb-2">${weekdays}</div>
    <div class="calendar-grid">${cells}</div>
  `;

  views.calendar.querySelectorAll("[data-date]").forEach(node => {
    node.addEventListener("click", () => openDay(node.dataset.date));
  });
}

// Renderiza la vista de tabla con los registros del mes.
function renderTable() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rows = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = ymd(new Date(year, month, day));
    const log = state.log[dateStr];
    if (!log) continue;
    for (const m of MEALS) {
      const items = (log[m.key] || []).join(" · ");
      if (items) rows.push({ dateStr, meal: m.label, items });
    }
  }

  views.table.innerHTML = rows.length ? `
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead><tr><th>Fecha</th><th>Comida</th><th>Selección</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td><button class="btn btn-link p-0" data-open="${r.dateStr}">${r.dateStr}</button></td>
              <td>${r.meal}</td>
              <td>${escapeHtml(r.items)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  ` : `<div class="text-secondary">Sin registros este mes.</div>`;

  views.table.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openDay(b.dataset.open)));
}

// Renderiza la vista de comidas con listado de opciones.
function renderMealsView() {
  views.meals.innerHTML = `
    <div class="row g-3">
      ${MEALS.map(m => `
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>${m.label}</span>
              <button class="btn btn-sm btn-outline-primary" data-browse="${m.key}">Ver opciones</button>
            </div>
            <div class="card-body">
              <div class="small-muted mb-2">Opciones disponibles (editables):</div>
              <ul class="mb-0">
                ${(state.options[m.key] || []).slice(0, 6).map(o => `<li>${escapeHtml(o.name)}</li>`).join("") || "<li>—</li>"}
              </ul>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  views.meals.querySelectorAll("[data-browse]").forEach(btn => {
    btn.addEventListener("click", () => {
      viewSelect.value = "options";
      switchView("options");
      highlightMeal(btn.dataset.browse);
    });
  });
}

// Renderiza la vista de ayuda con pautas generales y lista de la compra.
function renderHelp() {
  views.help.innerHTML = `
    <div class="row g-3">
      <div class="col-12 col-lg-8">
        <div class="card">
          <div class="card-header">Pautas del plan</div>
          <div class="card-body">
            ${HELP_TEXT.map(line => `<div>${escapeHtml(line)}</div>`).join("")}
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card">
          <div class="card-header">Lista de compra</div>
          <div class="card-body">
            <div class="fw-semibold">Proteínas</div>
            <ul>${SHOPPING.proteinas.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
            <div class="fw-semibold">Carbohidratos</div>
            <ul>${SHOPPING.carbohidratos.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
            <div class="fw-semibold">Grasas</div>
            <ul class="mb-0">${SHOPPING.grasas.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Renderiza la vista de opciones, permite editar/añadir/borrar.
function renderOptions() {
  views.options.innerHTML = `
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
            <span id="optTitle">Opciones</span>
            <button id="addOptBtn" class="btn btn-sm btn-primary">Añadir</button>
          </div>
          <div class="card-body">
            <div id="optBody" class="small-muted">Elige una comida a la izquierda.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const mealList = el("mealList");
  const optTitle = el("optTitle");
  const optBody = el("optBody");
  const addOptBtn = el("addOptBtn");

  let selected = null;

  function draw() {
    if (!selected) return;
    const label = MEALS.find(x => x.key === selected)?.label || selected;
    optTitle.textContent = `Opciones — ${label}`;
    const list = state.options[selected] || [];
    optBody.innerHTML = list.length ? `
      <div class="list-group">
        ${list.map((o, i) => `
          <div class="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-semibold">${escapeHtml(o.name)}</div>
              <div class="small-muted">${escapeHtml(o.notes || "")}</div>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" data-edit="${i}">Editar</button>
              <button class="btn btn-outline-danger" data-delopt="${i}">Borrar</button>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<div class="text-secondary">Sin opciones. Añade una.</div>`;

    optBody.querySelectorAll("[data-delopt]").forEach(b => b.addEventListener("click", () => {
      const i = Number(b.dataset.delopt);
      state.options[selected].splice(i, 1);
      saveState(state);
      draw();
    }));

    optBody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
      const i = Number(b.dataset.edit);
      const cur = state.options[selected][i];
      const name = prompt("Nombre", cur.name);
      if (!name) return;
      const notes = prompt("Notas (opcional)", cur.notes || "") ?? cur.notes;
      state.options[selected][i] = { name: name.trim(), notes: (notes || "").trim() };
      saveState(state);
      draw();
    }));
  }

  mealList.querySelectorAll("[data-meal]").forEach(btn => {
    btn.addEventListener("click", () => {
      selected = btn.dataset.meal;
      mealList.querySelectorAll(".active").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      draw();
    });
  });

  addOptBtn.addEventListener("click", () => {
    if (!selected) return setAlert("Selecciona primero Desayuno/Comida/Merienda/Cena.", "warning");
    const name = prompt("Nombre de la opción");
    if (!name) return;
    const notes = prompt("Notas (opcional)") || "";
    state.options[selected].push({ name: name.trim(), notes: notes.trim() });
    saveState(state);
    draw();
  });

  // Permite resaltar desde la vista "meals".
  window.__highlightMeal = (mealKey) => {
    const btn = mealList.querySelector(`[data-meal="${mealKey}"]`);
    btn?.click();
  };
}

function highlightMeal(mealKey) {
  window.__highlightMeal?.(mealKey);
}

// Función para escapar HTML y evitar inyección.
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

// Controles globales de la interfaz.
monthPicker.value = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

monthPicker.addEventListener("change", () => {
  currentMonth = parseMonthValue(monthPicker.value);
  render(viewSelect.value);
});

viewSelect.addEventListener("change", () => switchView(viewSelect.value));

el("resetBtn").addEventListener("click", () => {
  if (!confirm("Esto borra TODO el registro local. ¿Seguro?")) return;
  resetAll();
  state = loadState();
  state.options = structuredClone(DEFAULT_OPTIONS);
  saveState(state);
  render(viewSelect.value);
  setAlert("Reset hecho.", "warning");
});

el("exportBtn").addEventListener("click", () => {
  const url = exportJSON();
  const a = document.createElement("a");
  a.href = url;
  a.download = "nutri_webapp_export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

el("importInput").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  await importJSON(file);
  state = loadState();
  render(viewSelect.value);
  setAlert("Importado.", "success");
});

// Render inicial.
switchView("calendar");