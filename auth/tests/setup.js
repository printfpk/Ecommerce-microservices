const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock Redis
jest.mock('../src/db/redis', () => ({
  set: jest.fn(),
  get: jest.fn(),
  on: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
}));

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	process.env.MONGODB_URL = uri; // Ensure connectDB uses this
	process.env.JWT_SECRET='testsecret'; // Set a test JWT secret
	await mongoose.connect(uri);
});

beforeEach(async () => {
	// Clean database between tests
	const collections = await mongoose.connection.db.collections();
	for (const collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	if (mongoose.connection.readyState === 1) {
		await mongoose.connection.close();
	}
	if (mongoServer) {
		await mongoServer.stop();
	}
});
