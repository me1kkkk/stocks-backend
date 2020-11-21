const mongoose = require("mongoose");

// Replace this with your MONGOURI.
const MONGOURI =
    "mongodb+srv://meik:PXDrJk5vq8QHL2mL@cluster0.cyc4j.mongodb.net/<database>?retryWrites=true&w=majority",
  InitiateMongoServer = async () => {
    try {
      await mongoose.connect(MONGOURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to DB !!");
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

module.exports = InitiateMongoServer;
