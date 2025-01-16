const mongoose = require("mongoose");
require("dotenv").config();
const dbConnect =() => {
      mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
      }).then(() => {
            console.log("data base connected successfully");
      }).catch((err) => {
            console.log("Error while connecting", err);
      })
}
module.exports = dbConnect;