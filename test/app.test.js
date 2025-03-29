const request = require('supertest');
const app = require('../app');

describe('Test de l\'application', () => {
  test('GET / devrait retourner un message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Bonjour');
  });

  test('GET /health devrait retourner un statut OK', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});