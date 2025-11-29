const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/user.model');

describe('GET /api/auth/me', () => {
  it('should return the current user profile when authenticated', async () => {
    // Create a user
    const user = await User.create({
      username: 'testuser_me',
      email: 'me@test.com',
      password: 'password123',
      fullName: { firstName: 'Test', lastName: 'User' }
    });

    // Generate a valid token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    // Make request with cookie
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      username: 'testuser_me',
      email: 'me@test.com'
    });
    // Ensure password is not returned
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});
