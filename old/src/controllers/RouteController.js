// RouteController.js
// Controlador para la navegación por hash en la SPA

export class RouteController {
  constructor(appController) {
    this.appController = appController;
    window.addEventListener('hashchange', () => this.onHashChange());
    // Si hay hash al cargar, navegar a esa vista
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && this.appController.views[initialHash]) {
      this.appController.viewSelect.value = initialHash;
      this.appController.switchView(initialHash);
    }
  }

  onHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && this.appController.views[hash]) {
      this.appController.viewSelect.value = hash;
      this.appController.switchView(hash);
    }
  }

  setHash(view) {
    window.location.hash = `#${view}`;
  }
}
