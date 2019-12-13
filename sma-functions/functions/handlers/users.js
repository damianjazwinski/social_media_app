const { db } = require("../util/admin");
const { isEmail, isEmpty } = require("../helpers");
const firebase = require("firebase");

exports.singup = (request, response) => {
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

  // add to admin.db
  let token, userId;
  admin.db
    .doc(`/users/${newUser.handle}`)
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
      admin.db
        .doc(`/users/${newUser.handle}`)
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
};
exports.login = (request, response) => {
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
};
