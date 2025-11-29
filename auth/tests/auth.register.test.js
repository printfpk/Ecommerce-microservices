const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');

describe('POST /api/auth/register', () => {
  it('creates a user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'StrongPass123',
        fullName: { firstName: 'John', lastName: 'Doe' }
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toMatchObject({ username: 'john_doe', email: 'john@example.com' });
    const inDb = await User.findOne({ username: 'john_doe' }).select('+password');
    expect(inDb).not.toBeNull();
    expect(inDb.password).not.toBe('StrongPass123'); // hashed
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x' });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'dup',
        email: 'dup@example.com',
        password: 'StrongPass123',
        fullName: { firstName: 'Du', lastName: 'P' }
      });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'dup',
        email: 'dup2@example.com',
        password: 'StrongPass123',
        fullName: { firstName: 'Du', lastName: 'P' }
      });
    expect(res.status).toBe(409);
  });
});
