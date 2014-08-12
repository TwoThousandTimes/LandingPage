var express = require('express');
var router = express.Router();
var db = require('../models');
var validator = require('validator');

/* 
*	Render the Index page.
*/
router.get('/', function (req, res) {
	res.render('index', { title: 'Express' });
});

/**
*	Process email/username info. The following are valid username and email formats
*		username:
*			valid characters: a-z, A-Z, 0-9, - and _
*			length: 3-15 chars
*		email:
*			(refer to node_modules/node-validator for email validation specifics)
*	resposes:
		200: username succesfully reserved
			{
				success {
					username:
					email:
				},
				error: 'error message'
			}
		500: database transaction error
*/
router.post('/process/username', function (req, res) {
	// Before accessing database ensure that the email and username are both valid.
	var usernameRegex = /^[a-zA-Z0-9\-\_]{3,15}$/;
	var validUsername = validator.matches( req.body.username, usernameRegex );
	var validEmail = validator.isEmail( req.body.email );

	console.log('process: ' + req.body.username + ' ' + validUsername + '  ' + req.body.email + ' ' + validEmail);

	if (!validUsername)
		return res.status(200).send({error: 'Invalid username. Allowed characters: a-z, 0-9, -, and _'});
	if (!validEmail)
		return res.status(200).send({error: 'Invalid email format.'});

	db.User.findOrCreate(
		db.sequelize.or(
      		{ username: req.body.username },
      		{ email: req.body.email }
    	),
    	{
    		username: req.body.username,
    		email: req.body.email
    	}
	).success( function ( user, created ) {

		if (created) {
			// The username/email was saved!
			res.status(200).send({success: { username: req.body.username, email: req.body.email }});	
		} else if (user) {
			if (user.dataValues.username === req.body.username) {
				// the username already exists in db
				res.status(200).send({error: 'The username has already been taken!'});
			} else {
				// assume the email already exists in db
				res.status(200).send({error: 'The email is already in use.'});
			}			
		} else {
			res.status(500).send();  // Not sure if this is reachable, but just in case.
		}
	
	}).error(function(err) {
		res.status(500).send(err);
	});
});

module.exports = router;
