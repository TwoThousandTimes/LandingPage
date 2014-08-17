var express = require('express');
var router = express.Router();
var db = require('../models');
var validator = require('validator');
var config = require('../config');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var jade = require('jade');

//var email_text = jade.renderFile('views/htmlemail.jade', {person : 'test'});
//	console.log(email_text);

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport(ses({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    rateLimit: 1
}));

/*
*	Render the Index page.
*/
router.get('/', function (req, res) {
	res.render('index2', { title: 'Two Thousand Times', cdn: config.cdn ? config.cdn : '' });
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
			
			var email_text = jade.renderFile('views/text.jade', {person : req.body.username});
			var email_html = jade.renderFile('views/htmlemail.jade', {person : req.body.username});
			//console.log(email_text);

			// =======================   SEND NEW USER EMAIL CONFIRMATION  =============================
			// setup e-mail data with unicode symbols
			var mailOptions = {
			    from: config.email, // sender address
			    to: req.body.email, // receiver
			    subject: config.email_subject, // Subject line
			    text: email_text, // plaintext body

			    html: email_html
			};

			// send mail with defined transport object
			smtpTransport.sendMail(mailOptions, function(err, response){
			    if(err) console.log(err);
			    else console.log("Message sent: " + response.message);
			    // smtpTransport.close(); // shut down the connection pool, no more messages
			});			



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
