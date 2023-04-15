const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();
const serverLog = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let topMovies = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
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
  res.json(topMovies);
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
