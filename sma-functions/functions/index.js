const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("../social-app-b9983-firebase-adminsdk-r926o-930645935c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-app-b9983.firebaseio.com"
});

const express = require("express");
const app = express();

app.get("/screams", (request, response) => {
  admin
    .firestore()
    .collection("screams")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push(doc.data());
      });
      return response.json(screams);
    })
    .catch(err => console.error(err));
});

app.post("/scream", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };
  admin
    .firestore()
    .collection("screams")
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

exports.api = functions.https.onRequest(app);
