const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const serverLog = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
let users = [
  {
    id: 1,
    name: "Mary",
    favoriteMovies: [],
  },
];
let movies = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    Author: "J.K. Rowling",
    Description: "xxxx xxx xxx",
    Genre: {
      Name: "Fantacy",
      Description: "xxx xxx xxx xxx",
    },
    Director: {
      Name: "J.K. Rowling",
      Bio: "xxxx xxxx xxx xx",
    },
    ImageUrl: "xxxx xxx xxx",
    Featured: false,
  },
  {
    title: "Lord of the Rings",
    author: "J.R.R. Tolkien",
  },
  {
    title: "The Social Network",
    author: "Netflix",
  },
  {
    title: "Romeo and Juliet",
    author: "Williams Shakespeare",
  },
  {
    title: "Spirit - Stallion of Cimarron ",
    author: "DreamWorks Animation",
  },
  {
    title: "The Wizard of Oz",
    author: "L.Frank Baum",
  },
  {
    title: "Macbeth",
    author: "Williams Shakespeare",
  },
  {
    title: "The Tempest",
    author: "Williams Shakespeare",
  },
  {
    title: "The Lion King",
    author: "Disney Animation",
  },
  {
    title: "Forrest Gump",
    author: "Winston Groom",
  },
];

// logs connections and requests from terminal to log.txt
app.use(morgan("combined", { stream: serverLog }));

// logs connections and requests to terminal
app.use(morgan("common"));

app.get("/movies", (req, res) => {
  res.json(movies);
});

// return movies details
app.get("/movies/:title", (req, res) => {
  const title = req.params.title;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("movie not found!");
  }
});

// returns genre details
app.get("/movies/genre/:genreName", (req, res) => {
  const genreName = req.params.genreName;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("movie not found!");
  }
});

// returns director details
app.get("/movies/director/:directorName", (req, res) => {
  const directorName = req.params.directorName;
  const directors = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (directors) {
    res.status(200).json(directors);
  } else {
    res.status(400).send("director not found!");
  }
});

// allow users to register
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("input user name");
  }
});

// allow users to update user info
app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("user not found");
  }
});

// allow user to update favorite movies
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.send(`${movieTitle} has been added to your favorite movies`);
  } else {
    res.status(400).send("user not found");
  }
});

// allow user to delete favorite movie
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res.send(`${movieTitle} has been removed from your favorite movies list`);
  } else {
    res.status(400).send("user not found");
  }
});

// allow users to deregister
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((id) => users.id != id);
    res.status(200).send(`user with ID ${id} has been deleted`);
  } else {
    res.status(400).send("user not found");
  }
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
