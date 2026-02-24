/**
 * MealAdder class
 * Handles adding meal options to a day's log using a Bootstrap modal with a select input.
 * Usage: Instantiate and call show(dateStr, mealType, options, callback)
 */
import { saveState } from "./storage.js";

export class MealAdder {
  constructor(modalInstance) {
    this.modal = modalInstance;
  }

  show(dateStr, mealType, options, onAdd) {
    const selectId = "mealOptionSelect";
    const modalBody = `
      <form id="mealAdderForm">
        <div class="mb-3">
          <label for="${selectId}" class="form-label">Select an option for ${mealType}</label>
          <select class="form-select" id="${selectId}">
            ${options.map(o => `<option value="${o.id}">${o.name}${o.notes ? ' — ' + o.notes : ''}</option>`).join("")}
          </select>
        </div>
      </form>
    `;
    this.modal.setContent({
      title: `Add option to ${mealType} (${dateStr})`,
      body: modalBody,
      buttons: [
        { label: "Add", class: "btn-primary", onClick: () => {
            const select = document.getElementById(selectId);
            const value = select.value;
            const selectedOption = options.find(o => String(o.id) === value);
            onAdd(selectedOption);
            this.modal.hide();
          }
        },
        { label: "Cancel", class: "btn-secondary", onClick: () => this.modal.hide() }
      ]
    });
    this.modal.show();
  }
}
