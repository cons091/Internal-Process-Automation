# Internal Process Automation System

Sistema backend para gestionar, auditar y automatizar solicitudes internas, diseñado con enfoque empresarial y preparado para integrarse con herramientas de automatización como Power Automate.

Este proyecto demuestra lógica de negocio real, control de roles, auditoría y automatización de procesos, más allá de un CRUD básico.

## Objetivo del Proyecto

El objetivo es simular un sistema corporativo real para la gestión de procesos internos como:

- Solicitudes de vacaciones  
- Solicitudes TI  
- Aprobaciones administrativas  

El sistema:

- Controla estados  
- Aplica reglas de negocio  
- Registra auditoría completa  
- Permite automatización de decisiones  
- Restringe acciones críticas por rol  

## Arquitectura

Arquitectura en capas, siguiendo buenas prácticas de backend:
Routes → Controllers → Services → Models → PostgreSQL

Separación clara de responsabilidades, facilitando:

- Mantenimiento  
- Escalabilidad  
- Testing  
- Integración futura (JWT, SSO, Power Automate, etc.)

## Stack Tecnológico

- Node.js  
- Express  
- PostgreSQL  
- SQL (constraints y validaciones)  
- dotenv  
- Postman (testing de API)

## Funcionalidades Principales

### Gestión de Solicitudes

- Crear solicitudes  
- Listar solicitudes  

Estados controlados:

- PENDING  
- APPROVED  
- REJECTED  

### Reglas de Negocio

- Solo solicitudes en estado PENDING pueden cambiar de estado  
- Estados validados tanto en backend como en base de datos  
- Prevención de reprocesos automáticos  

### Control de Roles

Roles soportados:

- ADMIN  
- USER  

Solo usuarios con rol ADMIN pueden:

- Aprobar solicitudes  
- Rechazar solicitudes  

Implementado mediante middleware de autorización.

### Auditoría de Cambios

Cada cambio de estado queda registrado con:

- Estado anterior  
- Estado nuevo  
- Usuario o sistema que realizó el cambio  
- Fecha y hora  

Endpoint dedicado:

GET /api/requests/:id/history

Esto permite trazabilidad completa, fundamental en entornos empresariales.

### Automatización de Procesos

El sistema incluye un endpoint de automatización que simula flujos empresariales similares a Power Automate:
POST /api/requests/:id/auto-process


Reglas actuales:

| Tipo de Solicitud | Resultado |
|-------------------|----------|
| TI                | Auto-aprobada |
| Vacaciones        | Requiere aprobación manual |

Las decisiones automáticas:

- Se auditan  
- No requieren intervención humana  
- Están diseñadas para ser disparadas por sistemas externos  

## Endpoints Principales

Crear solicitud:
POST /api/requests

Listar solicitudes:
GET /api/requests

Cambiar estado (solo ADMIN):
PUT /api/requests/:id/status


Headers requeridos:
x-user-role: ADMIN
Content-Type_ application/json

Ver historial de cambios:
GET /api/requests/:id/history

Automatizar decisión:
POST /api/requests/:id/auto-process


## Testing

Las pruebas fueron realizadas utilizando Postman, validando:

- Reglas de negocio  
- Control de roles  
- Automatización  
- Auditoría  

## Posibles Mejoras Futuras

- Autenticación con JWT  
- Tabla de usuarios y roles persistentes  
- Integración real con Power Automate / Webhooks  
- Frontend (React / Flutter)  
- Notificaciones por email  

## Valor Profesional del Proyecto

Este proyecto demuestra:

- Pensamiento orientado a procesos empresariales  
- Backend estructurado y escalable  
- Automatización real  
- Control de acceso  
- Auditoría completa  
- Buen diseño de API  

Ideal como proyecto de portafolio profesional.

## Autor

Constanza Vergara  
Backend Developer  
Node.js · PostgreSQL · Automatización de procesos
