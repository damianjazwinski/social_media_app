const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const serviceAccount = require("./social-app-b9983-firebase-adminsdk-r926o-930645935c.json");
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyAHGN_rNxbiSJC0Nojrjg3QB6ZsqG4KYas",
  authDomain: "social-app-b9983.firebaseapp.com",
  databaseURL: "https://social-app-b9983.firebaseio.com",
  projectId: "social-app-b9983",
  storageBucket: "social-app-b9983.appspot.com",
  messagingSenderId: "957899568066",
  appId: "1:957899568066:web:2a10dfae2969f8b1fc1c5b"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-app-b9983.firebaseio.com"
});
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

app.get("/screams", (request, response) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          userHandle: doc.data().userHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt
        });
      });
      return response.json(screams);
    })
    .catch(err => console.error(err));
});

app.post("/scream", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db.collection("screams")
    .add(newScream)
    .then(doc => {
      return response.json({
        message: `document ${doc.id} created successfully`
      });
    })
    .catch(err => {
      response.status(500).json({ error: "failed to create scream" });
    });
});
app.post("/singup", (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle
  };
  // TODO: validate data

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ handle: "this handle has been already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      db.doc(`/users/${newUser.handle}`)
        .set(userCredentials)
        .then(data => {
          return response.status(201).json({ token });
        });
    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email already in use" });
      } else {
        return response.status(500).json({ error: error.code });
      }
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
