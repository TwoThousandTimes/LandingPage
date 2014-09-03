var index = require('./routes/index');
var db = require('./models');

(function() {

	var args = process.argv;
	var verbose = args[2] == '-v';
	
	db.User.findAll().success( function ( users ) {
		users.forEach( function ( user ) {
			index.postRequestToStaging( user.username, user.email, function ( response ) {
				
				if ( verbose ) {
					if ( response.error ) {
						console.log('Error migrating [' + user.username + ', ' + user.email + ']: ' + response.error);
					} else {
						console.log('Successfully migrated [' + user.username + ', ' + user.email + ']');
					}
				}
			});
		});
	}).error( function ( err ) {
		console.log( err );
	});

})();
