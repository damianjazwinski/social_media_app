const functions = require("firebase-functions");
const app = require("express")();
const firebase = require("firebase");
const config = require("./util/config");
const admin = require("./util/admin");
firebase.initializeApp(config);
const { FBAuth } = require("./util/auth");
const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signup, login } = require("./handlers/users");

//----------------------------------------------------------------------------------------------------
// [ENDPOINT] get all screams endpoint
app.get("/screams", getAllScreams);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] put new scream endpoint
app.post("/scream", FBAuth, postOneScream);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] signup endpoint
app.post("/signup", signup);
//----------------------------------------------------------------------------------------------------
// [ENDPOINT] login endpoint
app.post("/login", login);
// main api route endpoint
exports.api = functions.region("europe-west1").https.onRequest(app);
