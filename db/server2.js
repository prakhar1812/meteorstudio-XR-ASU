const https = require('https');
const fs = require('fs');
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8000;
var MS = require("mongoskin");

var db = MS.db("mongodb://127.0.0.1:27017/test")

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var Client = require('node-rest-client').Client;

app.get("/", function (req, res) {
      res.redirect("/index.html");
});

var allFeeds = [];

app.get("/getallfeeds", function (req, res) {
    //var uID = req.query.userID;
  db.collection("mst").find().toArray(function(err, result){
      res.send(JSON.stringify(result)); // send response body
  });
});

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);
