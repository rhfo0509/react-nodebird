const passport = require("passport");
const local = require("./localStrategy");

module.exports = () => {
  passport.serializeUser(() => {});

  passport.deserializeUser(() => {});

  local();
};
