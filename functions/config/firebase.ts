import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { ServiceAccount } from 'firebase-admin';

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
} else {
  console.log('DOMAIN_FIREBASE_PRIVATE_KEY is loaded successfully.');
}

const firebaseApp = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const auth = getAuth(firebaseApp);
const bucket = getStorage(firebaseApp).bucket(process.env.DOMAIN_FIREBASE_STORAGEBUCKET);

export { auth, bucket };