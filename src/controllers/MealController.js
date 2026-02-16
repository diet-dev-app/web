// MealController.js
// Controlador para la lógica de comidas
import { saveState } from "../services/StorageService.js";
import { ApiService } from "../services/ApiService.js";

export class MealController {
  constructor(state) {
    this.state = state;
    this.api = new ApiService();
  }


  async addMeal(dateStr, mealType, mealOption, notes = "") {
    if (!this.state.log[dateStr]) {
      this.state.log[dateStr] = { desayuno: [], comida: [], merienda: [], cena: [] };
    }
    this.state.log[dateStr][mealType].push(mealOption);
    if (notes) {
      this.state.notes[dateStr] = notes;
    }
    saveState(this.state);
    // Sync with API
    try {
      await this.api.addMeal({ date: dateStr, mealOption, notes });
    } catch (e) {
      // Optionally handle error, e.g. revert state
      console.error('[MealController] Error syncing addMeal:', e);
    }
  }

  async removeMeal(dateStr, mealType, idx) {
    if (this.state.log[dateStr] && this.state.log[dateStr][mealType]) {
      const removed = this.state.log[dateStr][mealType].splice(idx, 1)[0];
      saveState(this.state);
      // Sync with API (requires meal id or enough info to identify)
      try {
        await this.api.deleteMeal({ date: dateStr, mealType, value: removed });
      } catch (e) {
        console.error('[MealController] Error syncing removeMeal:', e);
      }
    }
  }
}
