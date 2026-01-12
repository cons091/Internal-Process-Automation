# Internal Process Automation System

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-PERN-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Sistema integral Full Stack para la gestión, auditoría y automatización de procesos corporativos. Simula un entorno empresarial real permitiendo a los empleados generar solicitudes y a los administradores gestionarlas mediante flujos de aprobación seguros.

> **Evolución:** Este proyecto comenzó como una API Backend y evolucionó hacia una solución Full Stack completa, integrando seguridad con JWT, notificaciones por correo y una interfaz de usuario moderna.

## 🚀 Características Principales

### 🔒 Seguridad y Autenticación
* **Autenticación Real:** Implementación de **JWT (JSON Web Tokens)** para sesiones seguras.
* **Encriptación:** Contraseñas hasheadas utilizando **bcryptjs**.
* **Rutas Protegidas:** Sistema de navegación en Frontend que restringe el acceso según el rol (`ADMIN` o `USER`).

### 💻 Interfaz de Usuario (Frontend)
* **Diseño Moderno:** Construido con **React + Vite** y estilizado con **Tailwind CSS**.
* **Feedback Visual:** Notificaciones tipo "Toast" y modales elegantes usando **SweetAlert2**.
* **Manejo de Errores:** Páginas de 404 personalizadas y mensajes de error amigables.

### ⚙️ Lógica de Negocio y Backend
* **Gestión de Estados:** Flujo estricto de estados (`PENDING` -> `APPROVED` / `REJECTED`).
* **Auditoría Completa:** Registro inmutable de quién cambió qué y cuándo (Trazabilidad).
* **Automatización:** Endpoint inteligente que pre-aprueba solicitudes de bajo riesgo (ej: Soporte TI) y escala las críticas.
* **Notificaciones:** Envío de correos electrónicos automáticos mediante **Nodemailer** (SMTP) al registrarse o cambiar estados.

## 🛠️ Stack Tecnológico

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Axios (Interceptors & Async handling)
* SweetAlert2

**Backend:**
* Node.js & Express.js
* JSON Web Tokens (JWT)
* Nodemailer (Servicio de Email)
* PostgreSQL (Driver nativo `pg`)
* Raw SQL (Consultas optimizadas sin ORM)

## 📂 Arquitectura de Base de Datos

El proyecto utiliza **PostgreSQL** con una arquitectura relacional sólida.
Los scripts de creación (`schema.sql`) y datos de prueba (`seeds.sql`) se encuentran disponibles en la carpeta `/database` para facilitar la replicación del entorno.

* **Users:** Almacena credenciales y roles.
* **Requests:** Solicitudes generadas con reglas de negocio.
* **Request_History:** Auditoría de cambios de estado.

## 📸 Capturas de Pantalla


| Login | Dashboard Usuario | Dashboard Admin | Alertas SweetAlert |
|:---:|:---:|:---:|:---:|
| ![Login](/screenshots/login.png) | ![Dashboard](/screenshots/dash.png) | ![Alert](/screenshots/admin.png)| ![Alert](/screenshots/alert.png) |

## 🔧 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu máquina:

### 1. Clonar el repositorio
```bash
git clone https://github.com/cons091/Internal-Process-Automation.git
cd Internal-Process-Automation
```

### 2. Configurar Base de Datos
Asegúrate de tener PostgreSQL instalado.

Crea una base de datos llamada process_db (o el nombre que prefieras).

Ejecuta el script database/schema.sql para crear las tablas.

(Opcional) Ejecuta database/seeds.sql para tener usuarios de prueba.

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
Se realizaron pruebas manuales exhaustivas y pruebas de API utilizando Postman para validar:

* Flujos de autenticación (Login/Register).
* Protección de endpoints (Tokens inválidos/expirados).
* Reglas de negocio (Un usuario no puede aprobar su propia solicitud).

## Autor
### Constanza Vergara  
* Full Stack Developer
* Linkedin: https://www.linkedin.com/in/constanza-may-vergara-spencer-6008343a5/
* GitHub: https://github.com/cons091