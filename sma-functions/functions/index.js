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
// initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-app-b9983.firebaseio.com"
});
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

// get all screams endpoint
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

// put new scream endpoint
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

// helpers
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

const isEmail = email => {
  const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (email.match(regEx)) return true;
  else return false;
};

// singup endpoint
app.post("/singup", (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle
  };

  // validation
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Empty value";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Invalid value";
  }
  if (isEmpty(newUser.password)) errors.password = "Empty value";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Password must match";
  if (isEmpty(newUser.handle)) errors.handle = "Empty value";
  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  // add to db
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

// login endpoint
app.post("/login", (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password
  };

  let errors = {};

  if (!isEmail(user.email)) errors.email = "Invalid value";
  if (isEmpty(user.email)) errors.email = "Empty value";
  if (isEmpty(user.password)) errors.password = "Empty value";

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(idToken => {
      return response.json({ token: idToken });
    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        return response
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else return response.status(500).json({ error: error.code });
    });
});

// main api route endpoint
exports.api = functions.region("europe-west1").https.onRequest(app);
