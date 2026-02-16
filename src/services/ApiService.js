// ApiService.js
// Generic service for API communication


const API_BASE_URL = "http://localhost:8080";
export const API_ROUTES = {
  LOGIN: "/api/login",
  REGISTER: "/api/register",
  MEAL_OPTIONS: "/api/meal-options",
  MEALS: "/api/meals",
  USER: "/api/user",
  HOMEPAGE: "/"
};

export class ApiService {

  static API_ROUTES = API_ROUTES;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(path, { method = "GET", headers = {}, body = null, auth = false } = {}) {
    const url = this.baseUrl + path;
    const opts = { method, headers: { ...headers } };
    if (body) {
      opts.body = JSON.stringify(body);
      opts.headers["Content-Type"] = "application/json";
    }
    if (auth) {
      const token = localStorage.getItem("jwt_token");
      if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, opts);
    const contentType = res.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    if (data && typeof data === 'object') {
      if (data.token) localStorage.setItem("jwt_token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    }
    if (!res.ok) {
      throw { status: res.status, data };
    }
    return data;
  }


  login(email, password) {
    return this.request(API_ROUTES.LOGIN, {
      method: "POST",
      body: { email, password }
    });
  }

  // Meal Options CRUD
  async getMealOptions() {
    return this.request(API_ROUTES.MEAL_OPTIONS, { method: "GET", auth: true });
  }

  async addMealOption(mealType, option) {
    return this.request(`${API_ROUTES.MEAL_OPTIONS}/${mealType}`, {
      method: "POST",
      body: option,
      auth: true
    });
  }

  async updateMealOption(mealType, optionId, option) {
    return this.request(`${API_ROUTES.MEAL_OPTIONS}/${mealType}/${optionId}`, {
      method: "PUT",
      body: option,
      auth: true
    });
  }

  async deleteMealOption(mealType, optionId) {
    return this.request(`${API_ROUTES.MEAL_OPTIONS}/${mealType}/${optionId}`, {
      method: "DELETE",
      auth: true
    });
  }

  // Meals CRUD
  async getMeals() {
    return this.request(API_ROUTES.MEALS, { method: "GET", auth: true });
  }

  async addMeal(meal) {
    return this.request(API_ROUTES.MEALS, {
      method: "POST",
      body: meal,
      auth: true
    });
  }

  async updateMeal(mealId, meal) {
    return this.request(`${API_ROUTES.MEALS}/${mealId}`, {
      method: "PUT",
      body: meal,
      auth: true
    });
  }

  async deleteMeal(mealId) {
    return this.request(`${API_ROUTES.MEALS}/${mealId}`, {
      method: "DELETE",
      auth: true
    });
  }
}
