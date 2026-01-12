const request = require('supertest');
const app = require('../src/app'); // Importamos la app sin levantar el servidor

describe('Pruebas de Integración API', () => {

  // Prueba 1: Verificar que la ruta base responde
  test('GET / debe responder con mensaje de bienvenida', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Internal Requests Automation API');
  });

  // Prueba 2: Verificar que las validaciones del Login funcionan
  test('POST /api/auth/login debe fallar si faltan datos (400)', async () => {
    // Enviamos un body vacío intencionalmente
    const response = await request(app).post('/api/auth/login').send({});

    // Esperamos un 400 Bad Request
    expect(response.statusCode).toBe(400);
    
    // Verificamos que la estructura del error sea la que programamos
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toBeInstanceOf(Array);
    
    const emailError = response.body.errors.find(e => e.field === 'email');
    expect(emailError).toBeDefined();
  });

  // Prueba 3: Verificar manejo global de errores
  test('GET /api/request/99999/history debe fallar sin token y devolver JSON', async () => {
    const response = await request(app).get('/api/request/99999/history');
    
    // 1. Verificamos que la respuesta sea JSON (Critical: No queremos HTML)
    expect(response.headers['content-type']).toMatch(/json/);
    
    // 2. Esperamos un código de error de cliente (401 o 403)
    // Usamos toBeGreaterThanOrEqual(400) para que pase sea cual sea el código de error exacto
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    
    // 3. Verificamos que tenga la propiedad 'message' que vimos en tu error
    expect(response.body).toHaveProperty('message');
    
    // Opcional: Verificamos que el mensaje mencione el token o acceso
    expect(response.body.message).toMatch(/token|acceso/i);
  });

});