const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// defines the model for the interaction with movies database
let movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
    birth_date: Date,
  },
  image_path: String,
  featured: Boolean,
});

// defines the model for interaction with the users database
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birth_date: Date,
  favorite_movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "movie" }],
});

 userSchema.statics.hashPassword = (password) => {
   return bcrypt.hashSync(password, 10);
 };
 userSchema.methods.validatePassword = function (password) {
   return bcrypt.compareSync(password, this.password);
 };

let movie = mongoose.model("movie", movieSchema);
let user = mongoose.model("user", userSchema);

module.exports.movie = movie;
module.exports.user = user;
