"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const functions = require("firebase-functions");
const express_1 = __importDefault(require("express"));
const dotenv = require("dotenv");
// import passport from 'passport';
const app_1 = require("firebase/app");
const cors = require('cors');
// import fileUpload from 'express-fileupload';
const dbConn_1 = __importDefault(require("./config/dbConn"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const role_route_1 = __importDefault(require("./routes/role.route"));
const permission_routes_1 = __importDefault(require("./routes/permission.routes"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const vendor_route_1 = __importDefault(require("./routes/vendor.route"));
const vendorType_route_1 = __importDefault(require("./routes/vendorType.route"));
const contract_route_1 = __importDefault(require("./routes/contract.route"));
const review_route_1 = __importDefault(require("./routes/review.route"));
const requestFlow_route_1 = __importDefault(require("./routes/requestFlow.route"));
const budget_route_1 = __importDefault(require("./routes/budget.route"));
const procurement_route_1 = __importDefault(require("./routes/procurement.route"));
const logistics_route_1 = __importDefault(require("./routes/logistics.route"));
const vendorInventory_route_1 = __importDefault(require("./routes/vendorInventory.route"));
const companyInventory_route_1 = __importDefault(require("./routes/companyInventory.route"));
const transportInventory_route_1 = __importDefault(require("./routes/transportInventory.route"));
const accommodationInventory_route_1 = __importDefault(require("./routes/accommodationInventory.route"));
const customError_1 = __importDefault(require("./utils/customError"));
const express_session_1 = __importDefault(require("express-session"));
const os_1 = __importDefault(require("os"));
dotenv.config();
const tempDir = os_1.default.tmpdir();
console.log(`Temporary directory: ${tempDir}`);
// const firebaseConfig = {
//   apiKey: "AIzaSyBHM1VRun-gj48pqUH7z_6XO4PzYnF6Q_A",
//   authDomain: "ferncot-c294a.firebaseapp.com",
//   projectId: "ferncot-c294a",
//   storageBucket: "ferncot-c294a.firebasestorage.app",
//   messagingSenderId: "1088358180822",
//   appId: "1:1088358180822:web:febe21bce7374885416677"
// };
const firebaseConfig = {
    apiKey: "AIzaSyA8qkTr3k8cWuRILVeB3xun81k1DEB3tMs",
    authDomain: "geodrillmanagerserver.firebaseapp.com",
    projectId: "geodrillmanagerserver",
    storageBucket: "geodrillmanagerserver.firebasestorage.app",
    messagingSenderId: "930637568279",
    appId: "1:930637568279:web:94334bce8a25e875b4bf52",
    measurementId: "G-D28LNTK6ZN"
};
// Initialize Firebase
(0, app_1.initializeApp)(firebaseConfig);
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://ferncots.com'],
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
// Routes
app.use('/api/auth', auth_route_1.default);
app.use('/api/role', role_route_1.default);
app.use('/api/permission', permission_routes_1.default);
app.use('/api/user', user_route_1.default);
app.use('/api/vendor', vendor_route_1.default);
app.use('/api/vendorInventory', vendorInventory_route_1.default);
app.use('/api/companyInventory', companyInventory_route_1.default);
app.use('/api/transportInventory', transportInventory_route_1.default);
app.use('/api/accommodationInventory', accommodationInventory_route_1.default);
app.use('/api/vendorType', vendorType_route_1.default);
app.use('/api/contract', contract_route_1.default);
app.use('/api/review', review_route_1.default);
app.use('/api/requestFlow', requestFlow_route_1.default);
app.use('/api/budget', budget_route_1.default);
app.use('/api/procurement', procurement_route_1.default);
app.use('/api/logistics', logistics_route_1.default);
app.get('/api/great', (req, res) => {
    res.send('hahaha');
});
// Default route
app.get('/', (req, res) => {
    res.send('Server is running');
});
// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        verified: err.isEmailVerified !== undefined ? err.isEmailVerified : true,
    });
});
// Catch-all route for undefined endpoints
app.all("*", async (req, res) => {
    try {
        res.status(404).json({ message: "Route not found", status: 404 });
    }
    catch (error) {
        throw new customError_1.default(error.message, 500);
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    (0, dbConn_1.default)(); // Connect to the database
});
// Export the app for Firebase Functions
// exports.app = functions.https.onRequest(app);
// export default app;
//# sourceMappingURL=index.js.map