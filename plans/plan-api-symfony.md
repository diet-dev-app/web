# Plan de Acción: API Dieta en Symfony

## Objetivo
Crear una API ligera en PHP (Symfony) para gestionar la dieta de usuarios, reemplazando el uso de localStorage por almacenamiento y lógica en backend, con autenticación y gestión por usuario.

## 1. Estructura del Proyecto
- Carpeta `/api` en el proyecto.
- Symfony minimal, solo componentes esenciales.
- Configuración para fácil despliegue en servidores PHP.

## 2. Entidades y Base de Datos
- **Usuario**: id, email, password (hash), nombre (opcional).
- **Meal (Comida)**: id, user_id, nombre, calorias, fecha, notas (opcional).
- **Opción de Comida**: id, user_id, nombre, descripción (opcional).

## 3. Endpoints Necesarios
### Autenticación y Usuarios
- `POST /api/register` — Registro de usuario.
- `POST /api/login` — Login y obtención de token JWT.
- `GET /api/user` — Obtener datos del usuario autenticado.


### Meals (Comidas)
- `GET /api/meals` — Listar comidas del usuario autenticado.
- `POST /api/meals` — Crear nueva comida.
- `PUT /api/meals/{id}` — Editar comida existente.
- `DELETE /api/meals/{id}` — Eliminar comida.

### Opciones de Comida
- `GET /api/meal-options` — Listar opciones de comida del usuario.
- `POST /api/meal-options` — Crear nueva opción de comida.
- `PUT /api/meal-options/{id}` — Editar opción de comida existente.
- `DELETE /api/meal-options/{id}` — Eliminar opción de comida.

## 4. Seguridad
- Autenticación JWT.
- Protección de endpoints para acceso solo a datos del usuario autenticado.

## 5. Servicios y Controladores
- Controlador de Usuario (registro, login, perfil).
- Controlador de Meal (CRUD comidas).
- Controlador de Opción de Comida (CRUD opciones).
- Servicios para usuarios, comidas y opciones.
- Servicio de autenticación JWT.

## 6. Documentación y QA
- Documentar endpoints y ejemplos de uso.
- Instrucciones de instalación y despliegue.
- Pruebas básicas para endpoints principales.

## Información a Guardar por Usuario
- Datos de usuario (email, password, nombre).
- Comidas asociadas (nombre, calorías, fecha, notas).
- Opciones de comida personalizadas (nombre, descripción).

---

**Referencia:** Este plan debe ser seguido para la implementación de la API en `/api`.
