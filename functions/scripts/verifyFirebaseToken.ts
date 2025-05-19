// filepath: /c:/Users/edogh/OneDrive/Desktop/Ferncot/ferncot/ferncotbackend/src/scripts/verifyFirebaseToken.ts
import { auth } from '../config/firebase';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = async (token: string) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const user = await auth.getUser(uid);
    console.log('User information:', user);
  } catch (error) {
    console.error('Error verifying token:', error);
  }
};

// Replace 'your-token' with the actual token
verifyToken('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTczOTY1ODE4NywiZXhwIjoxNzM5NjYxNzg3LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BmZXJuY290LWMyOTRhLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAZmVybmNvdC1jMjk0YS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6InlvdXItdWlkIn0.MBzXV-Gilr7vnuJn3PhtslV25NQJc3QbTYYICkEyeMycZ83I6wAnYwStmivSaqWJWdGDFEzOp76Oi1OqpDOKb_BPCBqLxrvUtWIXGvPFttfrbFi8ltmgt3-khUCcQIQ8e2PVZgVvq6LB0Ztd3YbB-4ltSd0UJYKamD-6HIANWaL7yGwAvGl0LJCtOUZlDsGXbju9SJDjCKZCCpMeit-N2Z9jap75wNRXjH4S8i-O2Z93Ci0Be4OFHVwUNKT0hsP6lAYIVVMNZgRysGWhfUAuqndR0ePa-rA8635dIDDE_dKBkihx6J6onHQz3M6y-XcijEUcefdoTxPVEes_W06qUw');