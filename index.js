const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

// connecting to business model and database
const mongoose = require("mongoose");
const models = require("./model.js");
const { error } = require("console");
const movies = models.movie;
const users = models.user;
mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const serverLog = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// logs connections and requests from terminal to log.txt
app.use(morgan("combined", { stream: serverLog }));

// logs connections and requests to terminal
app.use(morgan("common"));

app.get("/movies", (req, res) => {
  movies.find().then((movies) => res.json(movies));
});

// return movies details
app.get("/movies/:title", (req, res) => {
  movies
    .findOne({ title: req.params.title })
    .then((title) => {
      res.json(title);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// returns movies by genre details
app.get("/movies/genre/:genreName", (req, res) => {
  movies
    .find({ "genre.name": req.params.genreName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// returns director details
app.get("/movies/director/:directorName", (req, res) => {
  movies
    .find({ "director.name": req.params.directorName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// allow users to register
app.post("/users", (req, res) => {
  users
    .findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + " already exists");
      } else {
        users
          .create({
            username: req.body.username,
            password: req.body.password,
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
});

// allow users to update user info
app.put("/users/:username", (req, res) => {
  users
    .findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
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
});

// allow user to update favorite movies
app.post("/users/:username/:movieId", (req, res) => {
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
});

// allow user to delete favorite movie
app.delete("/users/:username/:movieId", (req, res) => {
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
});

// allow users to deregister
app.delete("/users/:username", (req, res) => {
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
});

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

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
