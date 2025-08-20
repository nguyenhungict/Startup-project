import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCgXcgGk5dAyqEmTA4FreljFyx6f9v5xSM",
  authDomain: "startup-project-dd7f8.firebaseapp.com",
  projectId: "startup-project-dd7f8",
  storageBucket: "startup-project-dd7f8.firebasestorage.app",
  messagingSenderId: "131317835109",
  appId: "1:131317835109:web:28df44351efe6a0a752d8c",
  measurementId: "G-5JSQP39H8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
