"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("firebase-admin/auth");
const serviceAccount = {
    type: process.env.DOMAIN_FIREBASE_TYPE,
    project_id: process.env.DOMAIN_FIREBASE_PROJECT_ID,
    private_key_id: process.env.DOMAIN_FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.DOMAIN_FIREBASE_PRIVATE_KEY
        ? process.env.DOMAIN_FIREBASE_PRIVATE_KEY.replace(/\\n/gm, '\n') // Replace escaped newlines
        : undefined,
    client_email: process.env.DOMAIN_FIREBASE_CLIENT_EMAIL,
    client_id: process.env.DOMAIN_FIREBASE_CLIENT_ID,
    auth_uri: process.env.DOMAIN_FIREBASE_AUTH_URI,
    token_uri: process.env.DOMAIN_FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.DOMAIN_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.DOMAIN_FIREBASE_CLIENT_X509_CERT_URL,
};
// Debugging: Log the private_key to ensure it's correctly formatted
if (!serviceAccount.private_key) {
    console.error('Error: DOMAIN_FIREBASE_PRIVATE_KEY is missing or not formatted correctly.');
}
else {
    console.log('DOMAIN_FIREBASE_PRIVATE_KEY is loaded successfully.');
}
const firebaseApp = (0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount),
});
const auth = (0, auth_1.getAuth)(firebaseApp);
exports.auth = auth;
const bucket = (0, storage_1.getStorage)(firebaseApp).bucket(process.env.DOMAIN_FIREBASE_STORAGEBUCKET);
exports.bucket = bucket;
//# sourceMappingURL=firebase.js.map