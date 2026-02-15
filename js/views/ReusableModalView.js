// ReusableModalView.js
// View for reusable modal UI logic

/**
 * ReusableModal class
 * Encapsulates Bootstrap modal logic for reusable, configurable modals.
 * Usage: Instantiate with modal element, then call setContent() and show()/hide().
 */
export class ReusableModal {
  constructor(modalElement, options = {}) {
    this.modalElement = modalElement;
    this.bsModal = new bootstrap.Modal(modalElement);
    this.titleEl = options.titleEl || modalElement.querySelector(".modal-title");
    this.bodyEl = options.bodyEl || modalElement.querySelector(".modal-body");
    this.footerEl = options.footerEl || modalElement.querySelector(".modal-footer");
  }

  setContent({ title, body, buttons }) {
    if (this.titleEl) this.titleEl.textContent = title;
    if (this.bodyEl) this.bodyEl.innerHTML = body;
    if (this.footerEl) {
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
  }

  show() {
    this.bsModal.show();
  }

  hide() {
    this.bsModal.hide();
  }
}
