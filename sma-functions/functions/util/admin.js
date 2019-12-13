const admin = require("firebase-admin");
const serviceAccount = require("./social-app-b9983-firebase-adminsdk-r926o-930645935c.json");

const firebaseConfig = {
  apiKey: "AIzaSyAHGN_rNxbiSJC0Nojrjg3QB6ZsqG4KYas",
  authDomain: "social-app-b9983.firebaseapp.com",
  databaseURL: "https://social-app-b9983.firebaseio.com",
  projectId: "social-app-b9983",
  storageBucket: "social-app-b9983.appspot.com",
  messagingSenderId: "957899568066",
  appId: "1:957899568066:web:2a10dfae2969f8b1fc1c5b"
};

// initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-app-b9983.firebaseio.com"
});
const db = admin.firestore();

module.exports = { admin, db, firebaseConfig };
