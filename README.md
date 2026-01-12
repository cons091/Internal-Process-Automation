# Internal Process Automation System

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-PERN-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)

Sistema integral Full Stack para la gestión, auditoría y automatización de procesos corporativos. Simula un entorno empresarial real permitiendo a los empleados generar solicitudes y a los administradores gestionarlas mediante flujos de aprobación seguros.

> **Evolución:** Este proyecto comenzó como una API Backend y evolucionó hacia una solución Full Stack completa "Production Ready", integrando seguridad avanzada, validaciones estrictas, documentación automática y testing automatizado.

## 🚀 Características Principales

### 🔒 Seguridad y Autenticación
* **Autenticación Real:** Implementación de **JWT (JSON Web Tokens)** para sesiones seguras.
* **Seguridad Avanzada:** Protección de cabeceras HTTP con **Helmet** y Rate Limiting para prevenir ataques de fuerza bruta.
* **Encriptación:** Contraseñas hasheadas utilizando **bcryptjs**.
* **Rutas Protegidas:** Middlewares de autorización tanto en Backend como en Frontend.

### 💻 Interfaz de Usuario (Frontend)
* **Diseño Moderno:** Construido con **React + Vite** y estilizado con **Tailwind CSS**.
* **Feedback Visual:** Notificaciones tipo "Toast" y modales elegantes usando **SweetAlert2**.
* **Manejo de Errores:** Páginas de 404 personalizadas y mensajes de error amigables.

### ⚙️ Lógica de Negocio y Backend (Production Ready)
* **Validación de Datos (Input Validation):** Uso de `express-validator` para sanear y validar todas las entradas antes de procesarlas (Fail-Fast Strategy).
* **Documentación API:** Endpoints documentados bajo el estándar **OpenAPI (Swagger UI)** disponibles en `/api-docs`.
* **Manejo de Errores Global:** Arquitectura robusta para capturar excepciones y responder siempre con JSON estructurados.
* **Auditoría Completa:** Registro inmutable de quién cambió qué y cuándo (Trazabilidad).
* **Automatización:** Endpoint inteligente que pre-aprueba solicitudes de bajo riesgo.
* **Notificaciones:** Envío de correos automáticos mediante **Nodemailer**.

## 👥 Roles y Flujo de Uso

**Usuario:**
- Registro e inicio de sesión
- Creación de solicitudes
- Visualización de estado

**Administrador:**
- Gestión de solicitudes
- Aprobación / rechazo manual
- Auditoría de acciones

**Automatización:**
- Solicitudes de bajo riesgo se aprueban automáticamente según reglas de negocio


## 🛠️ Stack Tecnológico

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Axios (Interceptors & Async handling)
* SweetAlert2

**Backend:**
* Node.js & Express.js (v5)
* **Express-Validator** (Validación de esquemas)
* **Helmet** (Seguridad HTTP)
* **Swagger / OpenAPI** (Documentación)
* **Jest & Supertest** (Testing de Integración)
* JSON Web Tokens (JWT)
* Nodemailer
* PostgreSQL (Driver nativo `pg`)

## Arquitectura de Base de Datos

El proyecto utiliza **PostgreSQL** con una arquitectura relacional sólida.
Los scripts de creación (`schema.sql`) y datos de prueba (`seeds.sql`) se encuentran disponibles en la carpeta `/database`.

* **Users:** Almacena credenciales y roles.
* **Requests:** Solicitudes generadas con reglas de negocio.
* **Request_History:** Auditoría de cambios de estado.

## 📸 Capturas de Pantalla

| Login | Dashboard Usuario | Dashboard Admin | Documentación Swagger |
|:---:|:---:|:---:|:---:|
| ![Login](/screenshots/login.png) | ![Dashboard](/screenshots/dash.png) | ![Alert](/screenshots/admin.png)| ![Swagger](/screenshots/swagger.png) |

## 🔧 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu máquina:

### 1. Clonar el repositorio
```bash
git clone https://github.com/cons091/Internal-Process-Automation.git
cd Internal-Process-Automation
```

### 2. Configurar Base de Datos
Asegúrate de tener PostgreSQL instalado.

Crea una base de datos llamada process_db.

Ejecuta el script database/schema.sql.

(Opcional) Ejecuta database/seeds.sql para datos de prueba.

### 3. Configurar Backend
```bash
cd backend
npm install
```

Crea un archivo .env en la carpeta backend basado en:
```bash
PORT=3000
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=process_db
JWT_SECRET=tu_secreto_super_seguro
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

Ejecuta el servidor:
```bash
npm run dev
```
### 4. Configurar Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
Abre el navegador en la URL que te indique Vite

# Testing
El proyecto cuenta con una suite de tests automatizados de integración utilizando Jest y Supertest para garantizar la estabilidad del backend.

Para ejecutar las pruebas:
```bash
cd backend
npm test
```

Cobertura de pruebas:

* Health Checks del servidor.
* Validación de esquemas y rechazo de datos incorrectos (HTTP 400).
* Seguridad en rutas protegidas y manejo de tokens (HTTP 401/403).
* Respuesta consistente de errores en formato JSON.

Además, se cuenta con la documentación interactiva para pruebas manuales en: http://localhost:3000/api-docs

## Autor
### Constanza Vergara  
* Full Stack Developer
* Linkedin: https://www.linkedin.com/in/constanza-vergara-spencer/

* GitHub: https://github.com/cons091

