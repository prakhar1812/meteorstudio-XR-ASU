var fileHeaders = [];
var fileName = "";
var mapRoomDataset = [];
var coordinates = [];
var particleColors = [];

// App config
var express = require('express');
// var router = express.Router();
var app = express();
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

//nodemailer
//const nodemailer = require('nodemailer');

var admin = require('firebase-admin');
//var authAdmin = admin.initializeApp();
var serviceAccount = require("./auth-test-5501c-firebase-adminsdk-x0yut-f1ac9cd9f3.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://auth-test-5501c.firebaseio.com"
});

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
var firebaseConfig = {
    apiKey: "AIzaSyBuQHAlRSIKHc76nJT68V3rybrOP0qRu-4",
    authDomain: "auth-test-5501c.firebaseapp.com",
    databaseURL: "https://auth-test-5501c.firebaseio.com",
    projectId: "auth-test-5501c",
    storageBucket: "",
    messagingSenderId: "669797740837",
    appId: "1:669797740837:web:ccb206e3051f8308446acc"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var fs = require('fs');
var csv = require("csvtojson");
var csvHeaders = require('csv-headers');
var multer = require('multer');
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
//
var upload = multer({ storage: storage }).single('csvfile');
var db;
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
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

// GeoBatch
var GeoBatch = require('geobatch');
var geoBatch = new GeoBatch({
    apiKey: 'AIzaSyCm2_5m1YZ0GvEi64mcFKXDOeepWGdQjO4',
});

// Authentication -- utilizing Mozilla's client-sessions
const clientSessions = require('client-sessions');
app.use(clientSessions({
    cookieName: 'maproom',
    secret: 'temporarysecret', // set up as env variable later
    duration: 1000 * 60 * 10, // duration in milliseconds - set to 10 mins,
    activeDuration: 1000 * 60 * 5 // lengthens the duration as the user interacts with the site - set to 5 mins

}));

// MongoDB
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var mongoUri = "mongodb+srv://meteorstudio:Meteor101@maproom-rzdrm.mongodb.net/maproom";
var mongoose = require('mongoose');
var User = require('./config/user-model.js');
mongoose.set('useCreateIndex', true);

// Initialize the connection once
mongoose.connect(mongoUri, { useNewUrlParser: true }, function(err) {
    logWithTimeStamp("Maproom started");

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

// Logging tools
var intl = require('intl')
const intlDf = new Intl.DateTimeFormat('en-us', { hour: 'numeric', minute: 'numeric', second: 'numeric', day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'America/Phoenix' });

// Express Routing

/**
 * index
 */
app.get('/', function(req, res) {
	console.log("back to index");
	if(loggedUser)
	{
		                res.render('dashboard', {
		                    email: ""
                });
	}

	else
    res.render('index');
    //res.render('/', email: {""});
});


/**
 * createAccount
 */
app.post('/createAccount', function(req, res) {
    upload(req, res, function(err) {
        logWithTimeStamp('Attempting to create account: ', req.body.email);

        // create a user a new user
        const email = req.body.email;
        const password = req.body.password;
        if (req.body.password.length >= 6) {

            auth.createUserWithEmailAndPassword(email, password).then(cred => {
				loggedUser = cred.user;
                const email = cred.user.email;
                const uid = cred.user.uid;
                console.log(cred.user.email);
                console.log(req.body.password);
               // res.redirect('/dashboard');

                //

                var newUser = new User({
                    email: email,
                    uid: uid,
                    datasets: []
                });

                // save user to database
                newUser.save(function(err) {
                        if (err) {
                            logWithTimeStamp('Error occured during account creation.');
                            res.redirect('/#signupBtn');
                            //throw err; This was causing the crash when a duplicate email was found.
                        } else {
                            logWithTimeStamp('New user added:', newUser.email, req.body.password);
                            currentUser = newUser;
                        }

                                        res.render('dashboard', {
						                    email: ""
                });
                    })
                    //
            }).catch(function(error) {
                const code = error.code;
                const message = error.message;
                console.log(message);
            });


            //

        } else
            console.log('password must be 6 characters or greater');
    });
});
/**
 * login
 */
app.post('/login', function(req, res) {
    upload(req, res, function(err) {
        logWithTimeStamp('Logging in:', req.body);

        User.findOne({ email: req.body.email }, function(err, user) {
            if (err) {
                console.log('Error occured when finding user', err.message);
                //throw err;
            }

            if (!user) {
                res.render('index', { error: 'Invalid email or password.' });
            } else {
                auth.signInWithEmailAndPassword(req.body.email, req.body.password).then(cred => {
                        loggedUser = cred.user;
                        const displayName = user.email;
                        //			authState.emailAddress = user.email;
                        //console.log(displayName);
                        req.maproom.user = user;
                        console.log("redirecting");
                        console.log("pop");
                    })
                    //res.render('dashboard');
                res.render('dashboard', {
                    email: ""
                });

            };
        });
    });
    //res.render('dashboard');
});
//
app.post('/contact-form-handler.php', async function(req, res) {
/*	console.log("blahblahblah");

	const output = `
	<p> You have a new contact request </p>
	<h3> Contact Details:</h3>
	<ul>
	<li>Name: ${req.body.name}</li>
	<li>Email: ${req.body.email}</li>
	</ul>
	<h3>Message</h3>
	<p>${req.body.message}</p>
	`;

	let transporter = nodemailer.createTransport({
		service: 'Gmail',
	    auth: {
	       user: 'bra2091589@gmail.com',
	       pass: ''
	    	}
		});

	  let info = await transporter.sendMail({
	    from: '"Coordinate Contact" <bra2091589@gmail.com>', // sender address
	    to: "bra2091589@gmail.com", // list of receivers
	    subject: "Coordinate Contact Request", // Subject line
	    text: "Hello world?", // plain text body
	    html: output // html body
	  });

	  console.log("Message sent: %s", info.messageId);
	  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	  // Preview only available when sending through an Ethereal account
	  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

	  res.render('support');
*/
//}
});
/**
 * upload
 */
app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.send("Error uploading file.");
        }

        //reset values
        mapRoomDataset = [];
        coordinates = [];
        particleColors = [];

        // get colors from form
        for (var i = 0; i < 10; i++) {
            particleColors.push({
                r: req.body['color' + i + '_r'],
                g: req.body['color' + i + '_g'],
                b: req.body['color' + i + '_b']
            })
        }

        // If no errors, convert the csv file to json
        var categories = [];
        var csvFilePath = "temp/" + fileName;
        csv()
            .fromFile(csvFilePath)
            .then(function(result) {

                console.log('csv file was uploaded');
                // When parsing is finished, result will be here.
                //console.log(res);
                //console.log(res.length);
                var jsonObjects = result;

                // get file headers
                //var fileHeaders = [];
                var csvHeadersOptions = { file: csvFilePath, delimiter: ',' };
                csvHeaders(csvHeadersOptions, function(err, headers) {
                    if (!err) {
                        console.log(headers);
                        fileHeaders = headers;
                    }

                });

                var addresses = [];
                for (var i = 0; i < jsonObjects.length; i++) {
                    var address = "";
                    if (jsonObjects[i]["Street Address"] != null || jsonObjects[i]["Street Address"] != undefined) {
                        address = jsonObjects[i]["Street Address"] + " ";
                    }
                    if (jsonObjects[i]["City"] != null || jsonObjects[i]["City"] != undefined) {
                        address += jsonObjects[i]["City"] + " ";
                    }
                    if (jsonObjects[i]["State"] != null || jsonObjects[i]["State"] != undefined) {
                        address += jsonObjects[i]["State"] + " ";
                    }
                    if (jsonObjects[i]["Postal Code"] != null || jsonObjects[i]["Postal Code"] != undefined) {
                        address += jsonObjects[i]["Postal Code"] + " ";
                    }
                    address.replace("  ", " ");
                    addresses.push(address);
                    categories.push(jsonObjects[i]["Category"]);
                }

                geoBatch.geocode(addresses)
                    .on('data', function(data) {
                        var coordinate = { lat: data.location.lat, lng: data.location.lng }
                        coordinates.push(coordinate);
                        //console.log(coordinates.length);
                    })
                    .on('end', function() {
                        //this is the last block that gets executed when uploading data

                        // get column headers for custom variable types (e.g., "# of employees" or "revenue")
                        console.log("total points: " + jsonObjects.length);

                        createJSONFile(coordinates, fileHeaders, jsonObjects);


                        // send colors
                        var distinctCategories = categories.filter(distinctValues);
                        //res.end("" + distinctCategories.length);


                        // generate the table for user to confirm data
                        // var html ="";
                        // html += "<h2>Your data was uploaded successfully.</h2>";
                        // html += "<table border='1'>";
                        // html += "<tr>";
                        // for (var i = 0; i < fileHeaders.length; i++) {
                        // 	html += "<th>" + fileHeaders[i] + "</th>";
                        // }
                        // html += "</tr>";
                        // for (i in jsonObjects) {
                        // 	html += "<tr>";
                        // 	for (j in fileHeaders) {
                        // 	  	html += "<td>" + jsonObjects[i][fileHeaders[j]] + "</td>";
                        //   	}
                        //   	html += "</tr>";
                        // }
                        // html += "</table>"
                        //res.send(html);



                        //delete the user's original file from temp folder
                        fs.unlink(csvFilePath, function(err) {
                            if (err) return console.log(err);
                            console.log('original file deleted successfully');
                            res.redirect('/uploadFinished');
                        });

                    });
            });
    });
});




/**
 * dashboard
 */
app.get("/dashboard", function(req, res) {
    //console.log("currentUser:" + currentUser.email);
    //if (currentUser == undefined) {
    //	res.send("Please log in.");
    //} else {
    //	res.sendFile('dashboard.html', { root : VIEWS });
    //}
    console.log("test");

 //   while (email == " ? ? ? ") {
 //       console.log("test");
 //   }

    if (loggedUser) {
        res.render('dashboard', {
            email: loggedUser.email
        });
        console.log("User captured")
    } else {
        res.render('index', { error: "Please log in." });
    }
});

/**
 * create
 */
app.get("/create", function(req, res) {
    //console.log("currentUser:" + currentUser.email);

    //if (currentUser == undefined) {
    //	res.send("Please log in to add data.");
    //} else {
    //	res.sendFile('create.html', { root : VIEWS });
    //}

    if (loggedUser) {
        fileHeaders = [];
        res.render('create');
    }
});

/**
 * uploadFinished
 */
app.get("/uploadFinished", function(req, res) {
    //res.sendFile('uploadFinished.html', { root : VIEWS });
    res.render('uploadFinished');
});

/**
 * logout
 */
app.get("/logout", function(req, res) {
    //e.preventDefault();
    auth.signOut().then(() => {
        req.maproom.reset();
        loggedUser = null;
        res.redirect('/');
    })

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
//
/**
 *
 */
app.get("/support", function(req, res) {
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

    res.render('support');
});
//

/**
 * showDatasetTable
 */
app.get("/showDatasetTable", function(req, res) {
    var testUser = { email: loggedUser.email, password: loggedUser.password };


    User.findOne({ email: testUser.email }, function(err, user) {
        if (err) throw err;

        var namesList = [];
        for (var i = 0; i < user.datasets.length; i++) {
            namesList.push({ datasetName: user.datasets[i].datasetName, date: user.datasets[i].date });
        }
        res.send(JSON.stringify(namesList));
    });
});

/**
 * deleteDataset
 * TODO: this function needs to be fixed
 */
app.get("/deleteDataset", function(req, res) {
    console.log("deleting " + req.query.datasetName);


    //MongoClient.connect(mongoUri, { useNewUrlParser: true }, function(err, db) {
    // 	if (err) throw err;
    // 	var dbo = db.db("maproomdb");
    // 	var query = { datasetName: req.query.datasetName, date: req.query.date };
    // 	console.log(query);
    // 	dbo.collection("maproomdata").deleteOne(query, function(err, obj) {
    // 		if (err) throw err;
    // 		console.log("1 document deleted");

    // 		// send the row number to delete from table
    // 		res.end(req.query.rowIndex);
    // 		db.close();
    // 	});
    // });

    var query = { datasetName: req.query.datasetName, date: req.query.date, rowIndex: req.query.rowIndex };

    // mongoose.connect(mongoUri, { useNewUrlParser: true }, function(err) {
    //     if (err) throw err;
    //     console.log('Successfully connected to MongoDB');
    // });

    var testUser = { email: loggedUser.email, uid: loggedUser.uid };

    User.findOne({ email: testUser.email, uid: testUser.uid }, function(err, user) {
        if (err) throw err;
        if (user) console.log("user found");
        console.log(testUser.email);
        console.log(testUser.uid);
        var indicesToRemoveAt = [];
        for (var i = user.datasets.length - 1; i >= 0; i--) {
            if (user.datasets[i].datasetName == query.datasetName && user.datasets[i].date == query.date) {
                console.log(i);
                //indicesToRemoveAt.push(i);
                //console.log(user.datasets[i].datasetName);
                //console.log(user.datasets.remove(i));
                user.datasets.splice(i, 1);
                //i--;

            }
        }

        // for (var i = indicesToRemoveAt.length -1; i >= 0; i--) {
        // 	user.datasets.splice(indicesToRemoveAt[i], 1);
        // }

        user.save((err) => {
            if (err) throw err;
            console.log("deleted");
            res.redirect('/manageData'); //refresh table
            //res.send(query.rowIndex);

        });

    });
});

// Functions

/**
 * distinctValues
 * @param {*} value
 * @param {*} index
 * @param {*} self
 */
function distinctValues(value, index, self) {
    return self.indexOf(value) === index;
}

//
Array.remove = function(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};
//

/**
 * createJSONFile
 * @param {*} coordinates
 * @param {*} fileHeaders
 * @param {*} originalData
 */
function createJSONFile(coordinates, fileHeaders, originalData) {
    var presetValues = [];
    var numericalValues = []; //these values are plotted

    for (var i = 0; i < fileHeaders.length; i++) {
        console.log(fileHeaders[i]);

        if (fileHeaders[i] == "Street Address" ||
            fileHeaders[i] == "City" ||
            fileHeaders[i] == "State" ||
            fileHeaders[i] == "Postal Code" ||
            fileHeaders[i] == "Name" ||
            fileHeaders[i] == "Category" ||
            fileHeaders[i] == "Description") {
            presetValues.push(fileHeaders[i]);
        } else {
            //  if (typeof parseFloat(originalData[0][fileHeaders[i]]) == "number") {
            //if (typeof parseFloat(originalData[1][fileHeaders[i]]) == "number") {
            numericalValues.push(fileHeaders[i]);
            //}
            // }
        }
    }
    //console.log(numericalValues);

    for (var i = 0; i < coordinates.length; i++) {
        if (originalData[i] != undefined) {
            //var x = remap(coordinates[i].lng, -112.698, -111.417, 0, 134) / 134;
            //var y = remap(coordinates[i].lat, 33.19439748240166, 33.8900496563147, 0, 84) / 134;
            var zip;
            if (originalData[i]["Postal Code"] != undefined) {
                zip = originalData[i]["Postal Code"];
                if (zip.includes("-")) {
                    zip = zip.substring(0, zip.indexOf('-'));
                }
            } else {
                zip = undefined;
            }


            // current required variables: street, city, zip, name, category
            var numRequiredVariables = 5;


            // check if location is within map
            //if (x >= 0.0 && x <= 1.0 && y >= 0.0 && y <= 1.0) {
            var datapoint = {
                name: originalData[i].Name,
                //x: x,
                //y: y,
                lat: coordinates[i].lat,
                lng: coordinates[i].lng,
                city: originalData[i].City,
                zipcode: zip,
                category: originalData[i].Category,
                description: originalData[i].Description,
                valueTypes: numericalValues,
                valuesToPlot: []
                    //value1: parseFloat( originalData[i][numericalValues[0]] ),
                    //value2: parseFloat( originalData[i][numericalValues[1]] ),
            };


            for (var j = 0; j < datapoint.valueTypes.length; j++) {
                var value = parseFloat(originalData[i][numericalValues[j]]);
                console.log(value);
                datapoint.valuesToPlot.push(value);
            }

            mapRoomDataset.push(datapoint);
            //console.log(datapoint);
            //}
        }
    }


    //write the json object retrieved by the Unity app
    var mapRoomData = {
        date: Date.now(),
        datasetName: fileName.replace(".csv", ""),
        datapoints: mapRoomDataset,
        colors: particleColors
    };
    console.log("saving " + mapRoomData.datasetName + " to db");

    User.findOne({ email: loggedUser.email, uid: loggedUser.uid }, function(err, user) {
        console.log(loggedUser.email);
        console.log(loggedUser.uid);
        if (err) {
            throw err;
            console.log("error");
        }
        if (user) {
            console.log("Found User");
            user.datasets.push(mapRoomData);
            user.save((err) => {
                if (err) throw err
            });
        }
    });
}

/**
 * Remap
 * @param {} coordinate
 * @param {*} minimumInput
 * @param {*} maximumInput
 * @param {*} minimumOutput
 * @param {*} maximumOutput
 */
function remap(coordinate, minimumInput, maximumInput, minimumOutput, maximumOutput) {
    return (coordinate - minimumInput) * (maximumOutput - minimumOutput) / (maximumInput - minimumInput) + minimumOutput;
}

/**
 * logWithTimeStamp
 *
 * Generates a console.log() prefixed by a timestamp in the format "[01/01/2019, 9:24:15 PM]"
 * @param  {...any} messages
 */
function logWithTimeStamp(...messages) {
    console.log("[" + intlDf.format(Date.now()) + "] - ", ...messages);
}

// ROUTES ACCESSED THROUGH MOBILE APP

// retrieve list of all datasets (used by the mobile app)
// query should be domain:port/getDatasetList?email=myemail&password=mypassword&datasetName=mydatasetname
app.get("/getDatasetList", function(req, res) {
    console.log("Accessing " + req.query.uid);

    admin.auth().verifyIdToken(req.query.uid)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            console.log("decoded");

            var testUser = { email: req.query.email, uid: uid };

            if (req.query.email == "" || req.query.email == null || req.query.email == undefined) {
                testUser.email = currentUser.email;
                testUser.uid = currentUser.uid;
            }
            //res.send("Got this far " + req.query.uid);
            User.findOne({ email: testUser.email, uid: testUser.uid }, function(err, user) {
                if (err) throw err;
                console.log("Do you exist?");
                // test a matching password
                if (user) {
                    //console.log('Password match:', isMatch);
                    // if (isMatch) {/
                    var namesList = [];
                    for (var i = 0; i < user.datasets.length; i++) {
                        namesList.push(user.datasets[i].datasetName);
                    }
                    var namesListObj = { namesList: namesList };
                    console.log("Names are: " + namesList[0]);
                    res.send(JSON.stringify(namesListObj));
                    //} else {
                    //	res.send("Password does not match");
                    //}
                } else {
                    res.send("No user found");
                }
            });
        }).catch(function(error) {
            // Handle error
        });
});

app.get("/viewData", function(req, res) {

    var testUser = { email: req.query.email, password: req.query.uid };

    if (req.query.email == "" || req.query.email == null || req.query.email == undefined) {
        testUser.email = currentUser.email;
        testUser.password = currentUser.password;
    }

    User.findOne({ email: testUser.email }, function(err, user) {
        if (err) throw err;
        // test a matching password
        if (user) {
            //user.comparePassword(testUser.password, function(err, isMatch) {
            //  if (err) throw err;
            // console.log('Password match:', isMatch);
            for (var i = 0; i < user.datasets.length; i++) {
                if (user.datasets[i].datasetName == req.query.datasetName) {
                    res.send(JSON.stringify(user.datasets[i]));
                    return;
                }
            }
            //  });
        } else {
            res.send("No user found");
        }
    });
});
