/**
 * mock-api/server.js
 * Fake API server that mirrors the Diet API OpenAPI contract.
 * Run with: node mock-api/server.js
 * Listens on http://localhost:8080
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// In-memory state (resets on restart — fine for development)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TOKEN = 'mock-jwt-token-valid';

const MEAL_TIMES = [
  { id: 1, name: 'breakfast', label: 'Breakfast' },
  { id: 2, name: 'lunch',     label: 'Lunch' },
  { id: 3, name: 'snack',     label: 'Snack' },
  { id: 4, name: 'dinner',    label: 'Dinner' },
];

let users = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'demo1234',
    name: 'Demo User',
    createdAt: '2026-01-01T10:00:00+00:00',
    isActive: true,
    roles: ['ROLE_USER'],
  },
];

let mealOptions = [
  {
    id: 1,
    name: 'Oatmeal with banana',
    description: 'High-fibre breakfast',
    estimated_calories: 320,
    meal_time: MEAL_TIMES[0],
    ingredients: [
      { id: 1, name: 'Rolled oats',  quantity: 80,  unit: 'g'    },
      { id: 2, name: 'Banana',        quantity: 1,   unit: 'unit' },
      { id: 3, name: 'Almond milk',   quantity: 200, unit: 'ml'   },
    ],
  },
  {
    id: 2,
    name: 'Grilled chicken & rice',
    description: 'Balanced lunch',
    estimated_calories: 550,
    meal_time: MEAL_TIMES[1],
    ingredients: [
      { id: 4, name: 'Chicken breast', quantity: 180, unit: 'g' },
      { id: 5, name: 'White rice',      quantity: 100, unit: 'g' },
      { id: 6, name: 'Broccoli',        quantity: 150, unit: 'g' },
    ],
  },
  {
    id: 3,
    name: 'Greek yoghurt & berries',
    description: 'Afternoon snack',
    estimated_calories: 180,
    meal_time: MEAL_TIMES[2],
    ingredients: [
      { id: 7, name: 'Greek yoghurt', quantity: 200, unit: 'g'  },
      { id: 8, name: 'Mixed berries', quantity: 80,  unit: 'g'  },
      { id: 9, name: 'Honey',         quantity: 10,  unit: 'ml' },
    ],
  },
  {
    id: 4,
    name: 'Salmon with vegetables',
    description: 'Light, protein-rich dinner',
    estimated_calories: 480,
    meal_time: MEAL_TIMES[3],
    ingredients: [
      { id: 10, name: 'Salmon fillet', quantity: 150, unit: 'g' },
      { id: 11, name: 'Asparagus',     quantity: 120, unit: 'g' },
      { id: 12, name: 'Olive oil',     quantity: 15,  unit: 'ml'},
    ],
  },
  {
    id: 5,
    name: 'Scrambled eggs & toast',
    description: 'Quick protein breakfast',
    estimated_calories: 380,
    meal_time: MEAL_TIMES[0],
    ingredients: [
      { id: 13, name: 'Eggs',            quantity: 3,  unit: 'unit' },
      { id: 14, name: 'Whole-grain bread', quantity: 2, unit: 'slice'},
      { id: 15, name: 'Butter',           quantity: 10, unit: 'g'   },
    ],
  },
];

let meals = [
  {
    id: 1,
    name: 'Monday plan',
    calories: 1530,
    date: '2026-02-17T00:00:00+00:00',
    notes: 'Swim day – keep energy up',
    meal_times: buildMealTimes([1, 2, 3, 4]),
  },
  {
    id: 2,
    name: 'Tuesday plan',
    calories: 1700,
    date: '2026-02-18T00:00:00+00:00',
    notes: null,
    meal_times: buildMealTimes([5, 2, 3, 4]),
  },
  {
    id: 3,
    name: 'Wednesday plan',
    calories: 1600,
    date: '2026-02-19T00:00:00+00:00',
    notes: 'Rest day',
    meal_times: buildMealTimes([1, 2]),
  },
];

let nextMealId       = 4;
let nextOptionId     = 6;
let nextIngredientId = 16;
let nextUserId       = 2;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build meal_times structure from an array of mealOption IDs.
 * @param {number[]} optionIds
 * @returns {Array}
 */
function buildMealTimes(optionIds) {
  const grouped = {};
  MEAL_TIMES.forEach((mt) => { grouped[mt.id] = { ...mt, options: [] }; });

  optionIds.forEach((oid) => {
    const opt = mealOptions.find((o) => o.id === oid);
    if (opt) {
      const mtId = opt.meal_time.id;
      grouped[mtId].options.push({
        id:                  opt.id,
        name:                opt.name,
        description:         opt.description,
        estimated_calories:  opt.estimated_calories,
        ingredients:         opt.ingredients,
      });
    }
  });

  return Object.values(grouped).filter((mt) => mt.options.length > 0);
}

/**
 * Middleware: validate Bearer token.
 */
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  if (token !== MOCK_TOKEN) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next();
}

function log(method, path, status) {
  console.log(`[mock-api] ${method.toUpperCase()} ${path} → ${status}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET / — Health check
app.get('/', (req, res) => {
  log('GET', '/', 200);
  res.json({ message: 'API Diet is running', status: 'ok', timestamp: new Date().toISOString() });
});

// ── Auth ─────────────────────────────────────────────────────────────────────

// POST /api/register
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    log('POST', '/api/register', 400);
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (users.find((u) => u.email === email)) {
    log('POST', '/api/register', 400);
    return res.status(400).json({ errors: { email: 'This email is already registered.' } });
  }

  const newUser = {
    id: nextUserId++,
    email,
    password,
    name: name || null,
    createdAt: new Date().toISOString(),
    isActive: true,
    roles: ['ROLE_USER'],
  };
  users.push(newUser);
  log('POST', '/api/register', 201);
  res.status(201).json({ message: 'User registered successfully' });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    log('POST', '/api/login', 401);
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  log('POST', '/api/login', 200);
  res.json({ token: MOCK_TOKEN });
});

// ── User ──────────────────────────────────────────────────────────────────────

// GET /api/user
app.get('/api/user', requireAuth, (req, res) => {
  const user = users[0]; // always return first demo user
  log('GET', '/api/user', 200);
  const { password: _p, ...profile } = user;
  res.json(profile);
});

// ── Meals ─────────────────────────────────────────────────────────────────────

// GET /api/meals
app.get('/api/meals', requireAuth, (req, res) => {
  log('GET', '/api/meals', 200);
  res.json(meals);
});

// POST /api/meals
app.post('/api/meals', requireAuth, (req, res) => {
  const { date, name, calories, notes, meal_option_ids } = req.body || {};

  if (!date) {
    log('POST', '/api/meals', 400);
    return res.status(400).json({ error: 'date is required' });
  }

  const newMeal = {
    id: nextMealId++,
    name: name || null,
    calories: calories || 0,
    date: `${date}T00:00:00+00:00`,
    notes: notes || null,
    meal_times: buildMealTimes(meal_option_ids || []),
  };
  meals.push(newMeal);
  log('POST', '/api/meals', 201);
  const { meal_times: _mt, ...simple } = newMeal;
  res.status(201).json(simple);
});

// PUT /api/meals/:id
app.put('/api/meals/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = meals.findIndex((m) => m.id === id);

  if (idx === -1) {
    log('PUT', `/api/meals/${id}`, 404);
    return res.status(404).json({ error: 'Meal not found' });
  }

  const { name, calories, date, notes } = req.body || {};
  if (name    !== undefined) meals[idx].name     = name;
  if (calories !== undefined) meals[idx].calories = calories;
  if (date    !== undefined) meals[idx].date     = `${date}T00:00:00+00:00`;
  if (notes   !== undefined) meals[idx].notes    = notes;

  log('PUT', `/api/meals/${id}`, 200);
  const { meal_times: _mt, ...simple } = meals[idx];
  res.json(simple);
});

// DELETE /api/meals/:id
app.delete('/api/meals/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = meals.findIndex((m) => m.id === id);

  if (idx === -1) {
    log('DELETE', `/api/meals/${id}`, 404);
    return res.status(404).json({ error: 'Meal not found' });
  }

  meals.splice(idx, 1);
  log('DELETE', `/api/meals/${id}`, 200);
  res.json({ message: 'Meal deleted' });
});

// ── Meal Options ──────────────────────────────────────────────────────────────

// GET /api/meal-options
app.get('/api/meal-options', requireAuth, (req, res) => {
  log('GET', '/api/meal-options', 200);
  res.json(mealOptions);
});

// POST /api/meal-options
app.post('/api/meal-options', requireAuth, (req, res) => {
  const { name, description, meal_time_id, estimated_calories, ingredients } = req.body || {};

  if (!name || !meal_time_id) {
    log('POST', '/api/meal-options', 400);
    return res.status(400).json({ error: 'name and meal_time_id are required' });
  }

  const mealTime = MEAL_TIMES.find((mt) => mt.id === parseInt(meal_time_id));
  if (!mealTime) {
    log('POST', '/api/meal-options', 404);
    return res.status(404).json({ error: 'MealTime not found' });
  }

  const newOption = {
    id: nextOptionId++,
    name,
    description: description || null,
    estimated_calories: estimated_calories || null,
    meal_time: mealTime,
    ingredients: (ingredients || []).map((ing) => ({
      id: nextIngredientId++,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
  };
  mealOptions.push(newOption);
  log('POST', '/api/meal-options', 201);
  res.status(201).json(newOption);
});

// PUT /api/meal-options/:id
app.put('/api/meal-options/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = mealOptions.findIndex((o) => o.id === id);

  if (idx === -1) {
    log('PUT', `/api/meal-options/${id}`, 404);
    return res.status(404).json({ error: 'MealOption not found' });
  }

  const { name, description, meal_time_id, estimated_calories, ingredients } = req.body || {};

  if (name                !== undefined) mealOptions[idx].name = name;
  if (description         !== undefined) mealOptions[idx].description = description;
  if (estimated_calories  !== undefined) mealOptions[idx].estimated_calories = estimated_calories;

  if (meal_time_id !== undefined) {
    const mealTime = MEAL_TIMES.find((mt) => mt.id === parseInt(meal_time_id));
    if (!mealTime) {
      log('PUT', `/api/meal-options/${id}`, 404);
      return res.status(404).json({ error: 'MealTime not found' });
    }
    mealOptions[idx].meal_time = mealTime;
  }

  if (ingredients !== undefined) {
    mealOptions[idx].ingredients = ingredients.map((ing) => ({
      id: nextIngredientId++,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
  }

  log('PUT', `/api/meal-options/${id}`, 200);
  res.json(mealOptions[idx]);
});

// DELETE /api/meal-options/:id
app.delete('/api/meal-options/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = mealOptions.findIndex((o) => o.id === id);

  if (idx === -1) {
    log('DELETE', `/api/meal-options/${id}`, 404);
    return res.status(404).json({ error: 'MealOption not found' });
  }

  mealOptions.splice(idx, 1);
  log('DELETE', `/api/meal-options/${id}`, 200);
  res.json({ message: 'MealOption deleted' });
});

// ── Shopping List ─────────────────────────────────────────────────────────────

// GET /api/shopping-list
app.get('/api/shopping-list', requireAuth, (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    log('GET', '/api/shopping-list', 400);
    return res.status(400).json({ error: 'Missing start or end date' });
  }

  // Filter meals within date range
  const startDate = new Date(start);
  const endDate   = new Date(end);
  endDate.setHours(23, 59, 59);

  const rangeMeals = meals.filter((m) => {
    const d = new Date(m.date);
    return d >= startDate && d <= endDate;
  });

  if (rangeMeals.length === 0) {
    log('GET', '/api/shopping-list', 404);
    return res.status(404).json({ error: 'No meals found for this range' });
  }

  // Aggregate ingredients from all meal options in the range
  const ingredientMap = {};
  rangeMeals.forEach((meal) => {
    (meal.meal_times || []).forEach((mt) => {
      (mt.options || []).forEach((opt) => {
        (opt.ingredients || []).forEach((ing) => {
          const key = ing.name.toLowerCase();
          if (!ingredientMap[key]) {
            ingredientMap[key] = { name: ing.name, quantity: ing.quantity, unit: ing.unit, count: 1 };
          } else {
            ingredientMap[key].quantity += ing.quantity;
            ingredientMap[key].count += 1;
          }
        });
      });
    });
  });

  const shoppingList = Object.values(ingredientMap).map((item) => {
    // Assign a category based on name heuristics
    let category = 'Other';
    const lower = item.name.toLowerCase();
    if (['chicken', 'salmon', 'tuna', 'beef', 'egg', 'eggs'].some((p) => lower.includes(p))) category = 'Protein';
    else if (['oat', 'rice', 'bread', 'pasta', 'flour'].some((p) => lower.includes(p))) category = 'Grains';
    else if (['banana', 'berr', 'apple', 'orange', 'fruit'].some((p) => lower.includes(p))) category = 'Fruit';
    else if (['broccoli', 'asparagus', 'spinach', 'carrot', 'vegetab'].some((p) => lower.includes(p))) category = 'Vegetables';
    else if (['milk', 'yoghurt', 'butter', 'cheese'].some((p) => lower.includes(p))) category = 'Dairy';
    else if (['olive oil', 'honey', 'oil'].some((p) => lower.includes(p))) category = 'Condiments';

    return {
      name: item.name,
      quantity: `${item.quantity}${item.unit}`,
      category,
    };
  });

  log('GET', '/api/shopping-list', 200);
  res.json({
    shopping_list: shoppingList,
    notes: 'Try to buy organic produce when available.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🍽  Diet Mock API running at http://localhost:${PORT}`);
  console.log(`   Demo credentials: demo@example.com / demo1234`);
  console.log(`   Mock token:       ${MOCK_TOKEN}\n`);
});
