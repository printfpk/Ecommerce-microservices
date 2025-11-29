const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');

const baseUser = {
  username: 'login_user',
  email: 'login_user@example.com',
  password: 'LoginPass123',
  fullName: { firstName: 'Login', lastName: 'User' }
};

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create(baseUser);
  });

  it('logs a user in with email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: baseUser.email, password: baseUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(baseUser.email);
    expect(Array.isArray(res.headers['set-cookie'])).toBe(true);
  });

  it('logs a user in with username and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: baseUser.username, password: baseUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(baseUser.username);
  });

  it('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: baseUser.email, password: 'WrongPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('requires username or email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: baseUser.password });

    expect(res.status).toBe(400);
  });
});
