/**
 * ReusableModal class
 * Encapsulates Bootstrap modal logic for reusable, configurable modals.
 * Usage: Instantiate with modal element, then call setContent() and show()/hide().
 */
export class ReusableModal {
  constructor(modalElement) {
    this.modalElement = modalElement;
    this.bsModal = new bootstrap.Modal(modalElement);
    this.titleEl = modalElement.querySelector(".modal-title");
    this.bodyEl = modalElement.querySelector(".modal-body");
    this.footerEl = modalElement.querySelector(".modal-footer");
  }

  setContent({ title, body, buttons }) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = body;
    this.footerEl.innerHTML = "";
    buttons.forEach(btn => {
      const button = document.createElement("button");
      button.textContent = btn.label;
      button.className = `btn ${btn.class}`;
      button.type = "button";
      button.addEventListener("click", btn.onClick);
      this.footerEl.appendChild(button);
    });
  }

  show() {
    this.bsModal.show();
  }

  hide() {
    this.bsModal.hide();
  }
}
