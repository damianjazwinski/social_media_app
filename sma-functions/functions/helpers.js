const { db, admin } = require("./util/admin");
//-----------------------------
// helpers
exports.isEmpty = givenString => {
  if (givenString.trim() === "") return true;
  else return false;
};

exports.isEmail = email => {
  const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (email.match(regEx)) return true;
  else return false;
};

exports.FBAuth = (request, response, next) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    response.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      request.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", request.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      request.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(error => {
      console.error("Error while verifying token", error);
      return response.status(403).json(error);
    });
};
