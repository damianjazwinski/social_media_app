const functions = require("firebase-functions");
const app = require("express")();
const firebase = require("firebase");
const admin = require("./util/admin");
firebase.initializeApp(admin.firebaseConfig);
const { FBAuth } = require("./helpers");
const { getAllScreams, postOneScream } = require("./handlers/screams");
const { singup, login } = require("./handlers/users");

//----------------------------------------------------------------------------------------------------
// [ENDPOINT] get all screams endpoint
app.get("/screams", getAllScreams);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] put new scream endpoint
app.post("/scream", FBAuth, postOneScream);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] singup endpoint
app.post("/singup", singup);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] login endpoint
app.post("/login", login);
// main api route endpoint
exports.api = functions.region("europe-west1").https.onRequest(app);
