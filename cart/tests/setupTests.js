const path = require('path');
const Module = require('module');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const APP_PATH = path.resolve(process.cwd(), 'src', 'app.js');
const CART_ROUTES_ALIAS = path.resolve(process.cwd(), 'src', 'routes', 'cartRoutes');
const CART_ROUTES_TARGET = path.resolve(process.cwd(), 'src', 'routes', 'cart.routes');

if (!global.__cartRoutesPatched) {
	const originalResolve = Module._resolveFilename;
	Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
		const normalizedParent = parent?.filename ? path.normalize(parent.filename) : '';
		const normalizedRequest = path.normalize(request);

		const parentIsApp = normalizedParent === APP_PATH;
		const isDirectAlias = normalizedRequest === CART_ROUTES_ALIAS || normalizedRequest === `${CART_ROUTES_ALIAS}.js`;

		if ((parentIsApp && request === './routes/cartRoutes') || isDirectAlias) {
			request = CART_ROUTES_TARGET;
		}

		return originalResolve.call(this, request, parent, isMain, options);
	};
	global.__cartRoutesPatched = true;
}

afterAll(() => {
	// Reserved for future global cleanup logic.
});
