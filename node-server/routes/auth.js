const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");

// middle-ware
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

// User schema
const User = require("../schemas/user");

const router = express.Router();

// Register
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nickname, password } = req.body;
  try {
    const exUser = await User.findOne({ email: email }); // email is unique
    if (exUser) {
      return res.redirect("/join?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nickname,
      password: hash,
    });
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// Login
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // done call-back function
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    // save user in session
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // middleware extend
});

// Logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(); // delete user in session
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
