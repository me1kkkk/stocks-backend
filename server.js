const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./User");
const cors = require("cors");
const request = require("request");
const auth = require("./middleware/auth");
const SECRET_TOKEN = require("./config/config");
const InitiateMongoServer = require("./db");
const finnhubToken = "breeeofrh5rckh45b320";
var corsOptions = {
  origin: "https://finnhub.io",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

InitiateMongoServer();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

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

    jwt.sign(payload, SECRET_TOKEN.SECRET_TOKEN, (err, token) => {
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
      SECRET_TOKEN.SECRET_TOKEN,
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
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

app.post("/quotes", auth, (req, res) => {
  const { quote } = req.body;
  request(
    {
      method: "GET",
      url: `https://finnhub.io/api/v1/quote?symbol=${quote}&token=${finnhubToken}`,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        res.status(200).json(response.body);
      }
    }
  );
});

app.post("/stock", auth, (req, res) => {
  const { quote } = req.body;
  request(
    {
      method: "GET",
      url: `https://finnhub.io/api/v1/stock/${quote}?exchange=US&token=${finnhubToken}`,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.status(200).json(body);
      }
    }
  );
});

app.post("/add", async (req, res) => {
  const { symbol } = req.body;

  try {
    let stock = await User.findOne({ symbol });

    if (stock) {
      return res.status(400).json({
        msg: "Stock already exists",
      });
    }

    stock = new User({
      symbol,
    });

    res.status(200).send({ message: "Stock saved." });

    await user.save();
  } catch (e) {
    console.log(err.message);
    res.status(500).send("Error in Saving");
  }
});
