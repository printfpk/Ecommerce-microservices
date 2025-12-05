process.env.NODE_ENV = 'test';
process.env.IMAGEKIT_FOLDER = '/tests';
process.env.MAX_IMAGE_SIZE_BYTES = `${2 * 1024 * 1024}`; // keep uploads lightweight in tests

jest.setTimeout(30000);
