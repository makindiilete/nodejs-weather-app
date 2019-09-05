//this nodejs core module allow us perform file path manipulation (which we need to get to our public folder dir in this case)
const path = require("path");
//loading in express
const express = require("express");
//loading hbs to be able to use partials
const hbs = require("hbs");
const geocode = require("./utils/geocode");
const forecast = require("./utils/forecast");

//creating a new express app
const app = express();
//setting a prod and dev port
const port = process.env.PORT || 3000;
/////////////////////////////////////////////////////////////
/////////DEFINE PATHS FOR EXPRESS CONFIG/////////////////////
//here is a variable that takes the value of the path to the public dir
const publicDirectoryPath = path.join(__dirname, "../public");
//Path to our hbs files
const viewsPath = path.join(__dirname, "../templates/views");
//Partials path
const partialsPath = path.join(__dirname, "../templates/partials");
////////////////////////////////////////////////////////////////////////
/////////SETUP HANDLEBARS ENGINE & VIEWS LOCATION/////////////////////
//configuring express to use handlebar
app.set("view engine", "hbs");
//Setting express views to use custom path
app.set("views", viewsPath);
//setting our partials settings
hbs.registerPartials(partialsPath);
////////////////////////////////////////////////////////////////////////
/////////SETUP STATIC DIR TO SERVE//////////////////////////////////////
//app.use is a way to customize our server and we will customise the server to use the public folder. "express.static" customize our app.
app.use(express.static(publicDirectoryPath));

//Serving up the handlebars index dynamic page.
app.get("", (req, res) => {
  //we use res.render to serve a dynamic page. res.render is a function that takes two args : 1) the name of the hbs document without the extension 2) The dynamic content we want to use inside index.hbs
  res.render("index", {
    title: "Weather App",
    name: "Michaelz Omoakin"
  });
});
//Serving up the handlebars about dynamic page.
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Me",
    name: "Michaelz Omoakin"
  });
});
//Serving up the handlebars help dynamic page.
app.get("/help", (req, res) => {
  res.render("help", {
    title: "Help",
    helpText: "This is some helpful text",
    name: "Michaelz Omoakin"
  });
});
//Weather routes.
app.get("/weather", (req, res) => {
  if (!req.query.address) {
    res.send({
      error: "You must provide an address"
    });
    return;
  }
  // geocode(req.query.address, (error, response) => {
  //here we have set an empty object as the default params value for the properties we are destructuring from response object
  geocode(
    req.query.address,
    (error, { latitude, longitude, location } = {}) => {
      //if something goes wrong with geocode then we print a json object having property "error" and the value is the "error" argument
      if (error) {
        res.send({ error: error });
        return;
      }

      //Weather forecast function call and here we removed our hardcoded lat & long data and replaced it with the lat & long response inside geocode data object
      // forecast(response.body.features[0].center[1], response.body.features[0].center[0], (error, forecastData) => {
      forecast(latitude, longitude, (error, forecastData) => {
        //if something goes wrong with forecast, we also print the error and stop the code execution
        if (error) {
          res.send({ error: error });
          return;
        }
        //if all works well then we print the location, forecast
        if (!error) {
          res.send({
            forecast: forecastData,
            location: location,
            address: req.query.address
          });
        } else {
          console.log("Error ", error);
        }
      });
    }
  );
});

//Query string experiment
app.get("/products", (req, res) => {
  //if a "search" query string is not provided we send an error response and "return" to stop further execution of the code
  if (!req.query.search) {
    res.send({
      error: "You must provide a search term"
    });
    return;
  }
  console.log(req.query.search);
  res.send({
    products: []
  });
});
//404 nested error page.
app.get("/help/*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Michaelz Omoakin",
    errorMessage: "Help Article not found"
  });
});
//404 error page: - This must come last because express will first test all routes above to find match and when it finds none, it uses this.
app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Michaelz Omoakin",
    errorMessage: "Page not found."
  });
});

//Starting up the server.
app.listen(port, () => {
  console.log("Server is up on port " + port);
});
