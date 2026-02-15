# Diet App

## Overview

Diet App is a web application designed to help users manage their diet by tracking meals, users, and related data. The project follows modern frontend best practices, using Object-Oriented Programming (OOP) and the Model-View-Controller (MVC) pattern for maintainability and scalability. It also includes a lightweight Symfony-based PHP API backend for advanced features and integrations.

---

## Project Structure

```
/project-root
  |-- index.html                # Main HTML entry point
  |-- css/
  |     |-- styles.css          # Main stylesheet
  |-- js/
  |     |-- app.js              # App entry point
  |     |-- data.js             # Data handling
  |     |-- storage.js          # Local storage logic
  |     |-- MealAdder.js        # UI component for adding meals
  |     |-- ReusableModal.js    # UI modal component
  |     |-- controllers/        # MVC controllers
  |     |-- models/             # MVC models
  |     |-- services/           # Business logic/services
  |     |-- views/              # MVC views
  |-- assets/
  |     |-- images/             # App images
  |     |-- fonts/              # Fonts
  |-- docs/                     # Documentation and action plans
  |-- plans/                    # Project plans
  |-- tests/                    # Unit and integration tests
  |-- api/                      # Symfony PHP API backend
  |-- README.md                 # This file
```

---

## Purpose

- Help users manage and track their diet and meals.
- Provide a modular, scalable, and maintainable codebase for future enhancements.
- Serve as a reference for best practices in frontend and backend integration.

---

## Features

- Add, edit, and remove meals.
- User management (planned for API backend).
- Data persistence using local storage and/or API.
- Responsive and user-friendly UI.
- Modular MVC architecture (frontend).
- Symfony-based PHP API for advanced features (authentication, user/meal management).

---

## How to Run Locally

### Prerequisites
- Node.js (for frontend static server, optional)
- Docker & Docker Compose (for API backend)
- Composer (for PHP dependencies, handled by Docker)

### 1. Clone the Repository

```
git clone git@github.com:carlitosry/diet-app.git
cd diet-app
```

### 2. Run the Frontend

You can open `index.html` directly in your browser, or serve it with a static server:

```
npm install -g serve
serve .
```

Then open the provided local URL in your browser.

### 3. Run the API Backend (Symfony PHP)

From the `api/` directory:

```
cd api
# Start the containers (PHP, Nginx, etc.)
docker-compose up -d
# Install PHP dependencies (inside the container)
docker-compose exec php bash -c "cd app && composer install"
```

The API will be available at `http://localhost:8080/` (or as configured in `docker/nginx/conf.d/default.conf`).

---

## Usage

- Use the web interface to add, view, and manage meals.
- The API backend can be used for user authentication, meal management, and future mobile or external integrations.
- See `docs/` for action plans and methodology.

---

## Scope

- **Frontend:**
  - Pure JS, HTML, CSS (no frameworks)
  - Modular, OOP, MVC
  - Local storage for persistence
  - Ready for API integration
- **Backend:**
  - Symfony PHP API (Dockerized)
  - Endpoints for users, meals, authentication (see `docs/plan-api-symfony.md`)

---

## Documentation

- See `AGENTS.md` for architecture, methodology, and improvement guidelines.
- See `docs/` for action plans and API documentation.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Follow the OOP, MVC, and best practices outlined in `AGENTS.md`.
3. Document all changes and update relevant docs.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Authors

- Carlos R. Y. (carlitosry)
- Contributors welcome!
