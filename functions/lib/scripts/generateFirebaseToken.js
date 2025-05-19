"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
// const firebaseConfig = {
//   apiKey: 'YOUR_DOMAIN_FIREBASE_API_KEY',
//   authDomain: 'YOUR_DOMAIN_FIREBASE_AUTH_DOMAIN',
//   projectId: 'YOUR_DOMAIN_FIREBASE_PROJECT_ID',
//   storageBucket: 'YOUR_DOMAIN_FIREBASE_STORAGE_BUCKET',
//   messagingSenderId: 'YOUR_DOMAIN_FIREBASE_MESSAGING_SENDER_ID',
//   appId: 'YOUR_DOMAIN_FIREBASE_APP_ID',
// };
// const firebaseConfig = {
//     apiKey: "AIzaSyBHM1VRun-gj48pqUH7z_6XO4PzYnF6Q_A",
//     authDomain: "ferncot-c294a.firebaseapp.com",
//     projectId: "ferncot-c294a",
//     storageBucket: "ferncot-c294a.firebasestorage.app",
//     messagingSenderId: "1088358180822",
//     appId: "1:1088358180822:web:5a1696137f424660416677"
//   };
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
const app = (0, app_1.initializeApp)(firebaseConfig);
const auth = (0, auth_1.getAuth)(app);
// Sign in with Google
const signInWithGoogle = async () => {
    const provider = new auth_1.GoogleAuthProvider();
    try {
        const result = await (0, auth_1.signInWithPopup)(auth, provider);
        const idToken = await result.user.getIdToken();
        console.log('Firebase ID Token:', idToken);
    }
    catch (error) {
        console.error('Error signing in with Google:', error);
    }
};
signInWithGoogle();
// filepath: /c:/Users/edogh/OneDrive/Desktop/Ferncot/ferncot/ferncotbackend/src/scripts/generateFirebaseToken.ts
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';
// import dotenv from 'dotenv';
// import { ServiceAccount } from 'firebase-admin';
// dotenv.config();
// const serviceAccount = {
//     type: process.env.DOMAIN_FIREBASE_TYPE,
//     project_id: process.env.DOMAIN_FIREBASE_PROJECT_ID,
//     private_key_id: process.env.DOMAIN_FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.DOMAIN_FIREBASE_PRIVATE_KEY
//     ? process.env.DOMAIN_FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
//     : undefined, 
//     client_email: process.env.DOMAIN_FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.DOMAIN_FIREBASE_CLIENT_ID,
//     auth_uri: process.env.DOMAIN_FIREBASE_AUTH_URI,
//     token_uri: process.env.DOMAIN_FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url: process.env.DOMAIN_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.DOMAIN_FIREBASE_CLIENT_X509_CERT_URL,
//   };
//   // Initialize Firebase Admin SDK
//   const firebaseApp = initializeApp({
//     credential: cert(serviceAccount as ServiceAccount), // Explicitly cast
//   });
// // Get Firebase Auth instance
// const auth = getAuth(firebaseApp);
// const generateToken = async (uid: string) => {
//   try {
//     const token = await auth.createCustomToken(uid);
//     console.log('Generated Firebase token:', token);
//   } catch (error) {
//     console.error('Error generating Firebase token:', error);
//   }
// };
// // Replace 'your-uid' with the actual UID of the user
// generateToken('your-uid');
//# sourceMappingURL=generateFirebaseToken.js.map