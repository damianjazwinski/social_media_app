const { db, admin } = require("../util/admin");
//-----------------------------
// helpers
const isEmpty = givenString => {
  if (givenString.trim() === "") return true;
  else return false;
};

const isEmail = email => {
  const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (email.match(regEx)) return true;
  else return false;
};

exports.validateSignUpData = data => {
  // validation
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Empty value";
  } else if (!isEmail(data.email)) {
    errors.email = "Invalid value";
  }
  if (isEmpty(data.password)) errors.password = "Empty value";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Password must match";
  if (isEmpty(data.handle)) errors.handle = "Empty value";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (!isEmail(data.email)) errors.email = "Invalid value";
  if (isEmpty(data.email)) errors.email = "Empty value";
  if (isEmpty(data.password)) errors.password = "Empty value";

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
