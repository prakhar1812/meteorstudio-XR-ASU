// App config
var express = require('express');
// var router = express.Router();
var app = express();
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

const http = require('http');
const https = require('https');


app.use(express.static(__dirname, { dotfiles: 'allow' } ));
//nodemailer
//const nodemailer = require('nodemailer');

var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var fs = require('fs');
var multer = require('multer');
var error = "";
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'temp');
    },
    filename: function(req, file, callback) {
        fileName = req.body.datasetname + ".csv";
        callback(null, fileName);
    }
});
var loggedUser;
var loggedUser2;
var loggedUser3;
var loggedUser4;
var authState = {
    isAuthReady: false,
    isPerformingAuthAction: false,
    isVerifyingEmailAddress: false,
    isSignedIn: false,

    user: null,
    avatar: '',
    displayName: '',
    emailAddress: '',


    addAvatarDialog: {
        open: false,

        errors: null
    },

    changeAvatarDialog: {
        open: false,

        errors: null
    },


};
//var globalproduct = "5f2e1b687ca85a5fef49f0c1";
//
var upload = multer({ storage: storage }).single('csvfile');
var db;
var hostname = process.env.HOSTNAME || 'localhost';
var port = 80;
var currentUser; // Need to implement token/scope authentication
const path = require('path');
const VIEWS = path.join(__dirname, 'views');
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//var routes = require('./routes/index.js');
//app.use('/login', routes);
//app.use('/createAccount', routes)

// MongoDB
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
//var mongoUri = "mongodb+srv://meteorstudio:Meteor101@maproom-rzdrm.mongodb.net/maproom";
var mongoUri = "mongodb+srv://dbuser:test@cluster0.0jf1o.mongodb.net/cluster0?retryWrites=true&w=majority";
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);


// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/xr.asu.edu/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/xr.asu.edu/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/xr.asu.edu/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);
//
// httpServer.listen(8080);
// httpsServer.listen(8443);

// Initialize the connection once
mongoose.connect(mongoUri, { useNewUrlParser: true }, function(err) {
    console.log("XR@ASU started");


    if (err) {
        console.log('Error occured when connecting to MongoDB.', error.message);
        throw err;
    } else {
        console.log('Successfully connected to MongoDB');
    }

    // Start the application after the database connection is ready.
     app.listen(port);
    console.log("Server listening at http://" + hostname + ":" + port);
});
//

//searching by keyword
MongoClient.connect(mongoUri, function(err, db) {
    if (err) throw err;
    var dbo = db.db("xrasu");
    var keyword = "apartment";
    var regex = RegExp(".*" + keyword + ".*");
    // Note.find({ noteBody: regex, userID: userID })
    var myquery = { name: regex };
    //var myquery = { name: "Spacious and well located apartment" };
    //  var newvalues = { $set: {email: newEmail } };
    dbo.collection("products").find(myquery, { projection: { _id: 1, name: 1, address: 1 } }).toArray(function(err, result) {
        if (err) throw err;
        //  console.log(result);
        db.close();
    });
});

//


// Logging tools
var intl = require('intl')
const intlDf = new Intl.DateTimeFormat('en-us', { hour: 'numeric', minute: 'numeric', second: 'numeric', day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'America/Phoenix' });

// Express Routing

/**
 * index
 */

app.get('/', function(req, res) {
    //console.log(cookie);
    MongoClient.connect(mongoUri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("xrasu");
        var myquery = { name: "ASU Scavenger Hunt" };
        // var newvalues = { $set: {email: newEmail } };
        dbo.collection("products").findOne(myquery, "_id").then(result => {
                if (result) {
                    console.log("Successfully found document: " + result.name);
                    console.log(result);
                    //   loggedUser = result.name;
                    //   loggedUser2 = result.thumbnail;
                    //   loggedUser3 = result.description;

                } else {
                    //     console.log("No document matches the provided query.");
                }
                return result;
            })
            .catch(err => console.error(`Failed to find document: ${err}`));
        //});

        res.render('index', {
            // error: loggedUser,
            // error2: loggedUser2,
            // error3: loggedUser3
        });
    });





});


app.get("/manageData", function(req, res) {
    //console.log("getting dataset names");
    //res.sendFile('manageData.html', { root : VIEWS });

    // MongoClient.connect(mongoUri, { useNewUrlParser: true }, function(err, db) {
    // 	if (err) throw err;
    // 	var dbo = db.db("maproomdb");
    // 	dbo.collection("maproomdata").find({}).toArray( function(err, result) {
    // 		if (err) throw err;
    // 		var namesList = [];
    // 		for (var i = 0; i < result.length; i++) {
    // 			namesList.push({datasetName: result[i].datasetName, date: result[i].date});
    // 		}
    // 		res.send(JSON.stringify(namesList));
    // 		db.close();
    // 	});
    // });

    res.render('manageData');
});

/**
 * showDatasetTable
 */
app.get("/showDatasetTable", function(req, res) {

    MongoClient.connect(mongoUri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("xrasu");
        // var keyword = "flat";
        // var regex = RegExp(".*" + keyword + ".*");
        // Note.find({ noteBody: regex, userID: userID })
        // var myquery = { name: regex };
        // console.log(myquery);
        //var myquery = { name: "Spacious and well located apartment" };
        //  var newvalues = { $set: {email: newEmail } };
        // dbo.collection("products").find(myquery, { projection: { _id: 1, name: 1, address: 1, images: 1 } }).toArray(function (err, result) {
        //     if (err) throw err;
        //     console.log(result[0]);
        //     var namesList = [];
        //     for (var i = 0; i < result.length; i++) {
        //         namesList.push(result[i]);
        //     }
        //     res.send(JSON.stringify(namesList));
        //     db.close();
        // });

        dbo.collection("products").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);

            // res.send(JSON.stringify(namesList));
            res.send(JSON.stringify(result));

            db.close();
        });
    });


});

/**
 * FindData
 */
 /*
app.get("/findDatasetTable", function(req, res) {
    const query = req.query.search;
    var query2 = "";
    query2 = String(query);

    console.log(query);


    MongoClient.connect(mongoUri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("xrasu");
        var keyword = query;
        var regex = RegExp(".*" + keyword + ".*");
        // Note.find({ noteBody: regex, userID: userID })
        var myquery = { name: regex };
        console.log(myquery);
        //var myquery = { name: "Spacious and well located apartment" };
        //  var newvalues = { $set: {email: newEmail } };
        dbo.collection("products").find(myquery, { projection: { _id: 1, name: 1, address: 1, images: 1 } }).toArray(function(err, result) {
            if (err) throw err;
            console.log(result[0]);
            var namesList = [];
            for (var i = 0; i < result.length; i++) {
                namesList.push(result[i]);
            }
            res.send(JSON.stringify(namesList));
            db.close();
        });
    });




});
*/
app.get("/getProduct", function(req, res) {
    const query = req.query.product;
    var query2 = "";
    query2 = String(query);

 //   console.log(query);

    MongoClient.connect(mongoUri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("xrasu");
        var ObjectId = require('mongoose').Types.ObjectId;
        var keyword = query;
        var regex = RegExp(".*" + keyword + ".*");
        // Note.find({ noteBody: regex, userID: userID })
        var myquery = { _id: new ObjectId(query) };
        console.log(myquery);
        //var myquery = { name: "Spacious and well located apartment" };
        //  var newvalues = { $set: {email: newEmail } };
        dbo.collection("products").find(myquery, { projection: { _id: 1, name: 1, experienceType: 1, categories: 1, compatibleDevices: 1, description: 1, video: 1, thumbnail: 1, minimumRequirements: 1, credits: 1, screenshots: 1, releaseDate: 1,creationDate:1,createdBy:1,creatorURL:1,image: 1, url: 1, urls:1} }).toArray(function(err, result) {
            if (err) throw err;
            console.log(result[0]);
            var namesList = [];
            for (var i = 0; i < result.length; i++) {
                namesList.push(result[i]);
                console.log(result[i]);
            }
            res.send(JSON.stringify(namesList));
            db.close();
        });
    });
});


app.get("/productpage", function(req, res) {

    res.render('productpage', { globalproduct: "5f2e1b687ca85a5fef49f0c1"});
});

//webpage routes

app.get("/covidcampus", function(req, res) {
    res.render('productpage', { globalproduct: "5f37365a36d55f83a9c770a6"});
});

app.get("/career", function(req, res) {
    res.render('productpage', { globalproduct: "5f30f3147d7f876a9cdee2f6"});
});

app.get("/campus", function(req, res) {
    res.render('productpage', { globalproduct: "5f37383e36d55f83a9c770a7"});
});

app.get("/scav", function(req, res) {
    res.render('productpage', { globalproduct: "5f2e1b687ca85a5fef49f0c1"});
});
app.get("/scavenger", function(req, res) {
    res.render('productpage', { globalproduct: "5f2e1b687ca85a5fef49f0c1"});
});

app.get("/mimic", function(req, res) {
    res.render('productpage', { globalproduct: "5f387906d48d43237444a814"});
});

app.get("/virtualtutor", function(req, res) {
    res.render('productpage', { globalproduct: "5f3a0149f4e42a193bdbb45d"});
});
