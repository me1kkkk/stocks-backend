const mongoose = require("mongoose");

const StockSchema = mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// export model user with StockSchema
module.exports = mongoose.model("stock", StockSchema);
