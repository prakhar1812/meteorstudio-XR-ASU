import app from 'server'

/**
 * LoginController
 * 
 * Class file used to handle routing for login and account creation
 */


module.exports = {
    // Login
    login: function(req, res) {
        app.post('/login', function(req, res) {
    	upload(req, res, function(err) {
    		logWithTimeStamp('Logging in:', req.body);  
    		// fetch user and test password verification
    		currentUser = { 
    			email: req.body.email,
    			password: req.body.password,
    			datasets: []
    		}   
    		User.findOne({ email: req.body.email }, function(err, user) {
    			if (err) {
    				console.log('Error occured when finding user', err.message);
    				//throw err;
    			}   
    			if (!user) {
    				res.render('index', { error: 'Invalid email or password.' });
    			} else {
    				user.comparePassword(req.body.password, function(err, isMatch) {
    					if (isMatch) {
    						req.maproom.user = user;
    						res.redirect('/dashboard');
    					} else {
    						res.render('index', { error: 'Invalid email or password.' });
    					}
    				});
    			};
    		});
    	});	
    });
},  
    // Create Account
    createAccount: function(req, res) {
        app.post('/createAccount', function(req, res) {
            upload(req, res, function(err) {
                logWithTimeStamp('Attempting to create account: ', req.body.email);
        
                // create a user a new user
                var newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    datasets: []
                });
        
                // save user to database
                newUser.save(function(err) {
                    if (err) {
                        logWithTimeStamp('Error occured during account creation.');
                        res.redirect('/#signupBtn');
                        //throw err; This was causing the crash when a duplicate email was found.
                    } else {
                        logWithTimeStamp('New user added:', newUser.email);
                        currentUser = newUser;
                        res.redirect('/dashboard');
                    }
                })
            });
        });
    }
}