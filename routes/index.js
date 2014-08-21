var express = require('express');
var router = express.Router();
var db = require('../models');
var validator = require('validator');
var config = require('../config');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
/*
var ses = require('nodemailer-ses-transport');
var AmazonSES = require('amazon-ses');
var ses = new AmazonSES(config.accessKeyId, config.secretAccessKey);
*/
var jade = require('jade');

//var email_text = jade.renderFile('views/htmlemail.jade', {person : 'test'});
//	console.log(email_text);


// create reusable transport method (opens pool of SMTP connections)
var mailer = nodemailer.createTransport(
		smtpTransport({
			host: 'email-smtp.us-west-2.amazonaws.com',
			port: '2587',
			secure: false,
			auth: {
				user: 'AKIAJMBR2BQYZ6KG6RUA',
				pass: 'AlJlKnasivKsE2OEBbnkh5xoqDxyLi80KQhn49kCyZ9N'
			},
			tls: {
		        ciphers:'SSLv3'
		    }
		})
	);


/*
*	Render the Index page.
*/
router.get('/', function (req, res) {
	var ref = req.param('ref');
	if (ref) {
		// TODO: store the ref data in db!
		
	}
	res.render('index', { title: 'Two Thousand Times', cdn: config.cdn ? config.cdn : '' });
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
		return res.status(200).send({error: 'Invalid username. Allowed 3-15 characters: a-z, 0-9, -, and _'});
	if (!validEmail)
		return res.status(200).send({error: 'Invalid email format.'});

	db.User.find( { where: { username: req.body.username }} ).success( function ( user ) {
		
		if ( user ) {
			// Username already exists...
			res.status(200).send({error: 'The username has already been taken!'});
		} else {
			// Check if the email is already in use
			db.User.findAll( { where: { email: req.body.email }} ).success( function ( users ) {
				if ( users && users.length < 2 ) {
					// There is less than two usernames reserved for this user. Proceed to reserve!

					db.User.create( { username: req.body.username, email: req.body.email } ).success( function ( user ) {
						
						// =====================  Successfully reserved the username!  =====================
						res.status(200).send({success: { username: req.body.username, email: req.body.email }});
						// Send the email
						processEmail( req.body.username, req.body.email );

					}).error(function(err) {
						res.status(500).send(err);
					});
				} else {
					// There are already two usernames reserved for the given email!
					res.status(200).send({error: 'The email is already in use.'});
				}
			}).error(function(err) {
				res.status(500).send(err);
			});

		}

	}).error(function(err) {
		res.status(500).send(err);
	});

});

function processEmail ( username, email ) {
	var email_text = jade.renderFile('views/text.jade', {person : username});
	var email_html = jade.renderFile('views/htmlemail.jade', {person : username});
	//console.log(email_text);

	// =======================   SEND NEW USER EMAIL CONFIRMATION  =============================
	// setup e-mail data with unicode symbols

	var mailOptions = {
	    from: 'Two Thousand Times <' + config.email + '>', // sender address
	    to: email, // receiver
	    subject: config.email_subject, // Subject line
	    text: email_text, // plaintext body
	    html: email_html
	    
	};
	/*
	ses.send(mailOptions);
	*/
	
	// send mail with defined transport object
	mailer.sendMail(mailOptions, function(err, response){
	    if(err) console.log(err);
	    else console.log("Message sent: " + response.message);
	    // smtpTransport.close(); // shut down the connection pool, no more messages
	});
}

module.exports = router;
