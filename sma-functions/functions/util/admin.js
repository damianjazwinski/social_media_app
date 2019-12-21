const admin = require("firebase-admin");
const serviceAccount = require("./social-app-b9983-firebase-adminsdk-r926o-930645935c.json");

// initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-app-b9983.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
