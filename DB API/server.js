// call the packages we need
var express = require("express"); // call express
var app = express(); // define our app using express
app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Content-Type');
    res.header('Access-Control-Allow-Methods','GET','POST','PUT','DELETE','OPTIONS');
  next();
});


var bodyParser = require("body-parser"); //call body-parser
var mongoose = require("mongoose"); //call mongoose
mongoose.connect("mongodb://127.0.0.1:27017/Graph"); //connect database
//Handle the connection event
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));

db.once('open',function(){
    console.log("DB connection alive");
});


//Flow Model lives here
var Flow = require("./models/flow");
var Edge = require("./models/edge");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
var router = express.Router(); // get an instance of the express Router

//middleware to use for all requests
router.use(function(req, res, next) {
  console.log("Something is happening");
  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get("/", function(req, res) {
  res.json({ message: "hooray! welcome to our api!" });
});

router.route("/flows").get(function(req, res) {
  Flow.find(function(err, flows) {
    if (err) res.send(err);
    res.json(flows);
  });
});

router.route("/edges").get(function(req, res) {
  Edge.find(function(err, edges) {
    if (err) res.send(err);
    res.json(edges);
  });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use("/api", router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);
