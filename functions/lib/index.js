"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const functions = require("firebase-functions");
const express_1 = __importDefault(require("express"));
const dotenv = require("dotenv");
const cors = require('cors');
const dbConn_1 = __importDefault(require("./config/dbConn"));
const auth_route_1 = __importDefault(require("./features/auth/auth.route"));
const user_route_1 = __importDefault(require("./features/user/user.route"));
const property_route_1 = __importDefault(require("./features/property/property.route"));
const blog_route_1 = __importDefault(require("./features/blog/blog.route"));
const customError_1 = __importDefault(require("./utils/customError"));
const express_session_1 = __importDefault(require("express-session"));
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        url: req.url
    });
    next();
});
app.use('/api/auth', auth_route_1.default);
app.use('/api/user', user_route_1.default);
app.use('/api/property', property_route_1.default);
app.use('/api/blog', blog_route_1.default);
app.get('/', (req, res) => {
    res.send('Server is running');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        verified: err.isEmailVerified !== undefined ? err.isEmailVerified : true,
    });
});
app.all("*", async (req, res) => {
    try {
        res.status(404).json({ message: "Route not found", status: 404 });
    }
    catch (error) {
        throw new customError_1.default(error.message, 500);
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    (0, dbConn_1.default)();
});
//# sourceMappingURL=index.js.map