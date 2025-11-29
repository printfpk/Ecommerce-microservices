const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/user.model');

describe('GET /api/auth/logout', () => {
  it('should clear the token cookie and return success message', async () => {
    // Create a dummy user and token to simulate being logged in
    const user = await User.create({
      username: 'logout_user',
      email: 'logout@example.com',
      password: 'password123',
      fullName: { firstName: 'Logout', lastName: 'User' }
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/auth/logout')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
    
    // Check if the cookie is cleared
    // Usually this looks like 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    // Expect it to be empty or expired
    expect(tokenCookie).toMatch(/token=;|Expires=Thu, 01 Jan 1970/); 
  });

  it('should return 200 even if not logged in', async () => {
    const res = await request(app)
      .get('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
  });
});
