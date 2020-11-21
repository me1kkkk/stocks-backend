const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const uuid = require("uuid");
const User = require("./User");
const InitiateMongoServer = require("./db");
const auth = require("./middleware/auth");

const id = uuid.v4();
const accessTokenSecret = id;

InitiateMongoServer();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(5000, function () {
  console.log("listening on 5000");
});

app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, accessTokenSecret, (err, token) => {
      if (err) {
        throw err;
      }
      res.status(200).json({ token });
    });
  } catch (e) {
    console.log(err.message);
    res.status(500).send("Error in Saving");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({
      username,
    });
    if (!user)
      return res.status(400).json({
        message: "User Not Exist",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Incorrect Password !",
      });

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      "randomString",
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

function verifyToken(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info != undefined) {
      console.log(info.message);
      return res.status(500).send({
        loginState: false,
        message: info.message,
      });
    } else {
      req.user = user;
      req.user_id = JSON.stringify(req.user.id);
      return next();
    }
  })(req, res, next);
}
