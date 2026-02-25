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

  const { name, calories, date, notes, meal_option_ids } = req.body || {};
  if (name             !== undefined) meals[idx].name       = name;
  if (calories         !== undefined) meals[idx].calories   = calories;
  if (date             !== undefined) meals[idx].date       = `${date}T00:00:00+00:00`;
  if (notes            !== undefined) meals[idx].notes      = notes;
  if (meal_option_ids  !== undefined) meals[idx].meal_times = buildMealTimes(meal_option_ids);

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

// ── Caloric Goals ─────────────────────────────────────────────────────────────

let caloricGoals = [
  {
    id: 1,
    daily_calories: 1800,
    start_date: '2026-01-01',
    end_date: null,
    label: 'maintenance',
    notes: 'Baseline maintenance goal',
    created_at: '2026-01-01T10:00:00+00:00',
    updated_at: null,
  },
];
let nextGoalId = 2;

// GET /api/caloric-goals/active  (must be before /:id)
app.get('/api/caloric-goals/active', requireAuth, (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
  const check   = new Date(dateStr);
  const active  = caloricGoals.find((g) => {
    const start = new Date(g.start_date);
    const end   = g.end_date ? new Date(g.end_date) : null;
    return check >= start && (!end || check <= end);
  });
  if (!active) {
    log('GET', '/api/caloric-goals/active', 404);
    return res.status(404).json({ error: 'No active caloric goal for the given date' });
  }
  log('GET', '/api/caloric-goals/active', 200);
  res.json(active);
});

// GET /api/caloric-goals
app.get('/api/caloric-goals', requireAuth, (req, res) => {
  const sorted = [...caloricGoals].sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date),
  );
  log('GET', '/api/caloric-goals', 200);
  res.json(sorted);
});

// POST /api/caloric-goals
app.post('/api/caloric-goals', requireAuth, (req, res) => {
  const { daily_calories, start_date, end_date, label, notes } = req.body || {};
  if (!daily_calories || !start_date) {
    log('POST', '/api/caloric-goals', 400);
    return res.status(400).json({ error: 'daily_calories and start_date are required' });
  }
  const newGoal = {
    id: nextGoalId++,
    daily_calories: parseInt(daily_calories),
    start_date,
    end_date: end_date || null,
    label: label || null,
    notes: notes || null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };
  caloricGoals.push(newGoal);
  log('POST', '/api/caloric-goals', 201);
  res.status(201).json(newGoal);
});

// PUT /api/caloric-goals/:id
app.put('/api/caloric-goals/:id', requireAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = caloricGoals.findIndex((g) => g.id === id);
  if (idx === -1) {
    log('PUT', `/api/caloric-goals/${id}`, 404);
    return res.status(404).json({ error: 'Caloric goal not found' });
  }
  const { daily_calories, start_date, end_date, label, notes } = req.body || {};
  if (daily_calories !== undefined) caloricGoals[idx].daily_calories = parseInt(daily_calories);
  if (start_date     !== undefined) caloricGoals[idx].start_date     = start_date;
  if (end_date       !== undefined) caloricGoals[idx].end_date       = end_date;
  if (label          !== undefined) caloricGoals[idx].label          = label;
  if (notes          !== undefined) caloricGoals[idx].notes          = notes;
  caloricGoals[idx].updated_at = new Date().toISOString();
  log('PUT', `/api/caloric-goals/${id}`, 200);
  res.json(caloricGoals[idx]);
});

// DELETE /api/caloric-goals/:id
app.delete('/api/caloric-goals/:id', requireAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = caloricGoals.findIndex((g) => g.id === id);
  if (idx === -1) {
    log('DELETE', `/api/caloric-goals/${id}`, 404);
    return res.status(404).json({ error: 'Caloric goal not found' });
  }
  caloricGoals.splice(idx, 1);
  log('DELETE', `/api/caloric-goals/${id}`, 200);
  res.json({ message: 'Caloric goal deleted' });
});

// ── Meal Generation ───────────────────────────────────────────────────────────

// POST /api/meals/generate
app.post('/api/meals/generate', requireAuth, (req, res) => {
  const { date, target_calories } = req.body || {};
  const save = req.query.save === 'true';

  if (!date) {
    log('POST', '/api/meals/generate', 400);
    return res.status(400).json({ error: 'date is required' });
  }

  const targetCal = target_calories || caloricGoals[0]?.daily_calories || 2000;

  // Build a deterministic mock plan from existing meal options
  const breakfast = mealOptions.find((o) => o.meal_time.name === 'breakfast') || mealOptions[0];
  const lunch     = mealOptions.find((o) => o.meal_time.name === 'lunch')     || mealOptions[1];
  const snack     = mealOptions.find((o) => o.meal_time.name === 'snack')     || mealOptions[2];
  const dinner    = mealOptions.find((o) => o.meal_time.name === 'dinner')    || mealOptions[3];

  const planMeals = [breakfast, lunch, snack, dinner].filter(Boolean);
  const totalCal  = planMeals.reduce((s, o) => s + (o.estimated_calories || 0), 0);

  const planItems = planMeals.map((o) => ({
    meal_time:          o.meal_time.name,
    meal_option_id:     o.id,
    meal_option_name:   o.name,
    estimated_calories: o.estimated_calories || 0,
    reason:             `Good ${o.meal_time.name} option within the calorie budget`,
  }));

  let savedMeal = null;
  if (save) {
    const newMeal = {
      id:         nextMealId++,
      name:       `AI Plan – ${date}`,
      calories:   totalCal,
      date:       `${date}T00:00:00+00:00`,
      notes:      'Generated by AI',
      meal_times: buildMealTimes(planMeals.map((o) => o.id)),
    };
    meals.push(newMeal);
    savedMeal = { id: newMeal.id, name: newMeal.name, date };
  }

  log('POST', '/api/meals/generate', 201);
  res.status(201).json({
    date,
    target_calories: targetCal,
    total_calories:  totalCal,
    difference:      totalCal - targetCal,
    meals:           planItems,
    notes:           'Balanced plan based on your current meal options.',
    saved_meal:      savedMeal,
  });
});

// ── Meal Options Import ───────────────────────────────────────────────────────

// POST /api/meal-options/import  (multipart/form-data — mock ignores actual file)
app.post('/api/meal-options/import', requireAuth, (req, res) => {
  // In the mock we simply create 2 sample imported options
  const imported = [
    {
      name:               'Nutritionist Omelette',
      description:        'Imported from nutrition doc',
      estimated_calories: 350,
      meal_time_id:       1,
      ingredients:        [
        { name: 'Eggs', quantity: 3, unit: 'unit' },
        { name: 'Spinach', quantity: 50, unit: 'g' },
        { name: 'Feta cheese', quantity: 30, unit: 'g' },
      ],
    },
    {
      name:               'Nutritionist Salad Bowl',
      description:        'Imported from nutrition doc',
      estimated_calories: 290,
      meal_time_id:       2,
      ingredients:        [
        { name: 'Mixed greens', quantity: 100, unit: 'g' },
        { name: 'Cherry tomatoes', quantity: 80, unit: 'g' },
        { name: 'Grilled chicken', quantity: 100, unit: 'g' },
        { name: 'Olive oil', quantity: 15, unit: 'ml' },
      ],
    },
  ];

  const createdOptions = imported.map((opt) => {
    const mealTime = MEAL_TIMES.find((mt) => mt.id === opt.meal_time_id) || MEAL_TIMES[0];
    const newOpt = {
      id:                 nextOptionId++,
      name:               opt.name,
      description:        opt.description,
      estimated_calories: opt.estimated_calories,
      meal_time:          mealTime,
      ingredients:        opt.ingredients.map((ing) => ({
        id:       nextIngredientId++,
        name:     ing.name,
        quantity: ing.quantity,
        unit:     ing.unit,
      })),
    };
    mealOptions.push(newOpt);
    return newOpt;
  });

  log('POST', '/api/meal-options/import', 201);
  res.status(201).json({ imported: createdOptions.length, meal_options: createdOptions });
});

// ── Weekly Reports ────────────────────────────────────────────────────────────

let weeklyReports = [];
let nextReportId  = 1;

/**
 * Return the Monday of the week containing `date`.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
function getMonday(date) {
  const d   = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function buildWeeklyReport(weekStart, targetCal) {
  const start = new Date(weekStart);
  const end   = new Date(weekStart);
  end.setDate(end.getDate() + 6);

  const weekMeals = meals.filter((m) => {
    const d = new Date(m.date);
    return d >= start && d <= end;
  });

  const totalCal   = weekMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const daysTracked = weekMeals.length;
  const avgCal     = daysTracked > 0 ? Math.round(totalCal / daysTracked) : 0;
  const weekTarget = targetCal * 7;
  const diff       = totalCal - weekTarget;

  return {
    id:              nextReportId++,
    week_start:      weekStart,
    week_end:        end.toISOString().slice(0, 10),
    target_calories: targetCal,
    average_calories: avgCal,
    total_calories:  totalCal,
    days_tracked:    daysTracked,
    goal_adherence: {
      score:            Math.max(0, Math.min(100, 100 - Math.abs(Math.round(diff / weekTarget * 100)))),
      days_on_target:   Math.min(daysTracked, 4),
      days_over:        daysTracked > 4 ? daysTracked - 4 : 0,
      days_under:       daysTracked < 4 ? 4 - daysTracked : 0,
      days_not_tracked: 7 - daysTracked,
    },
    calorie_analysis: {
      daily_breakdown: weekMeals.map((m) => ({
        date:     m.date.slice(0, 10),
        calories: m.calories || 0,
        target:   targetCal,
      })),
      weekly_total:      totalCal,
      weekly_target:     weekTarget,
      weekly_difference: diff,
      average_daily:     avgCal,
    },
    nutritional_gaps: [
      { area: 'Protein', severity: 'low', detail: 'Protein intake looks adequate based on meal selections.' },
    ],
    achievements:  ['Tracked meals consistently', 'Hit caloric goal on most days'],
    notes_analysis: {
      patterns: ['Higher energy on swim days'],
      concerns: [],
      mood_trend: 'positive',
    },
    recommendations: [
      'Consider adding more vegetables to dinner options.',
      'Try to track every day to improve analysis accuracy.',
    ],
    summary:      `You tracked ${daysTracked} out of 7 days this week with an average of ${avgCal} kcal/day (target: ${targetCal} kcal).`,
    generated_at: new Date().toISOString(),
  };
}

// GET /api/reports/weekly/history  (must come before /api/reports/weekly)
app.get('/api/reports/weekly/history', requireAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '8'), 52);
  const history = weeklyReports
    .slice(-limit)
    .reverse()
    .map((r) => ({
      id:               r.id,
      week_start:       r.week_start,
      week_end:         r.week_end,
      score:            r.goal_adherence.score,
      average_calories: r.average_calories,
      days_tracked:     r.days_tracked,
    }));
  log('GET', '/api/reports/weekly/history', 200);
  res.json(history);
});

// GET /api/reports/weekly
app.get('/api/reports/weekly', requireAuth, (req, res) => {
  const weekStart  = req.query.week_start || getMonday(new Date());
  const regenerate = req.query.regenerate === 'true';

  if (!weekStart.match(/^\d{4}-\d{2}-\d{2}$/)) {
    log('GET', '/api/reports/weekly', 400);
    return res.status(400).json({ error: 'Invalid week_start format (expected YYYY-MM-DD)' });
  }

  const existing = weeklyReports.find((r) => r.week_start === weekStart);
  if (existing && !regenerate) {
    log('GET', '/api/reports/weekly', 200);
    return res.json(existing);
  }

  const targetCal = caloricGoals[0]?.daily_calories || 1800;
  const report    = buildWeeklyReport(weekStart, targetCal);

  if (existing && regenerate) {
    const idx = weeklyReports.indexOf(existing);
    weeklyReports.splice(idx, 1, report);
  } else {
    weeklyReports.push(report);
  }

  log('GET', '/api/reports/weekly', 200);
  res.json(report);
});

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🍽  Diet Mock API running at http://localhost:${PORT}`);
  console.log(`   Demo credentials: demo@example.com / demo1234`);
  console.log(`   Mock token:       ${MOCK_TOKEN}\n`);
});
