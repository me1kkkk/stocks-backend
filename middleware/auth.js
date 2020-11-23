const jwt = require("jsonwebtoken");
const SECRET_TOKEN = require("../config/config");
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log(SECRET_TOKEN.SECRET_TOKEN);
    jwt.verify(token, SECRET_TOKEN.SECRET_TOKEN, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
