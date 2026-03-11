process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db-skip-real';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'a05897b104494cfd58ae56026e5b14c5';
process.env.JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';
