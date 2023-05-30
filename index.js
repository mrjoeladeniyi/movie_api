const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
/*
//let allowedOrigins = [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application does not allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
*/
let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const { check, validationResult } = require("express-validator");

// connecting to business model and database
const mongoose = require("mongoose");
const models = require("./model.js");
const { error } = require("console");
const movies = models.movie;
const users = models.user;

// // connect to mongoose_local
// mongoose.connect("mongodb://localhost:27017/myFlixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });


// connect to mongoose_global
mongoose.connect(
  process.env.CONNECTION_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const serverLog = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// logs connections and requests from terminal to log.txt
app.use(morgan("combined", { stream: serverLog }));

// logs connections and requests to terminal
app.use(morgan("common"));

app.get(
  "/movies",
  //passport.authenticate("jwt", { session: false }),
  (req, res) => {
    movies.find().then((movies) => res.json(movies));
  }
);

// return movies details
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    movies
      .findOne({ title: req.params.title })
      .then((title) => {
        res.json(title);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// returns movies by genre details
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    movies
      .find({ "genre.name": req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// returns director details
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    movies
      .find({ "director.name": req.params.directorName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// return user by username
app.get(
  "/users/:userName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    users
      .find({ username: req.params.userName })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// allow users to register
app.post(
  "/users",
  [
    check(
      "username",
      "Username contains non alpanumeric charachters - not allowed"
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashPassword = users.hashPassword(req.body.password);
    users
      .findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + " already exists");
        } else {
          users
            .create({
              username: req.body.username,
              password: hashPassword,
              email: req.body.email,
              birth_date: req.body.birth_date,
            })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(() => {
        console.error(error);
        res.status(500).send("Error" + error);
      });
  }
);

// allow users to update user info
app.put(
  "/users/:username",
  [
    check(
      "username",
      "Username contains non alpanumeric charachters - not allowed"
    ).isAlphanumeric(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let hashPassword = users.hashPassword(req.body.password);
    users
      .findOneAndUpdate(
        { username: req.params.username },
        {
          $set: {
            username: req.body.username,
            password: hashPassword,
            email: req.body.email,
            birth_date: req.body.birth_date,
          },
        },
        { new: true }
      )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// allow user to update favorite movies
app.post(
  "/users/:username/:movieId",
  [
    check(
      "username",
      "Username contains non alpanumeric charachters - not allowed"
    ).isAlphanumeric(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    users
      .findOneAndUpdate(
        { username: req.params.username },
        { $addToSet: { favorite_movies: req.params.movieId } },
        { new: true }
      )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// allow user to delete favorite movie
app.delete(
  "/users/:username/:movieId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    users
      .findOneAndUpdate(
        { username: req.params.username },
        { $pull: { favorite_movies: req.params.movieId } },
        { new: true }
      )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// allow users to deregister
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    users
      .findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + " was not found");
        } else {
          res.status(200).send(req.params.username + " was deleted");
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.get("/", (req, res) => {
  res.send("This is myFlix API");
});

// routes all requests for static files to their corresponding files in the public folder
app.use(express.static("public"));

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
  next();
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on port " + [port]);
});
