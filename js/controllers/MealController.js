// MealController.js
// Controlador para la lógica de comidas
import { saveState } from "../services/StorageService.js";

export class MealController {
  constructor(state) {
    this.state = state;
  }

  addMeal(dateStr, mealType, value) {
    if (!this.state.log[dateStr]) {
      this.state.log[dateStr] = { desayuno: [], comida: [], merienda: [], cena: [] };
    }
    this.state.log[dateStr][mealType].push(value);
    saveState(this.state);
  }

  removeMeal(dateStr, mealType, idx) {
    if (this.state.log[dateStr] && this.state.log[dateStr][mealType]) {
      this.state.log[dateStr][mealType].splice(idx, 1);
      saveState(this.state);
    }
  }
}
