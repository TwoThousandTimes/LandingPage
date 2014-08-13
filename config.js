'use strict';

var production = process.env.NODE_ENV === 'production';

module.exports = {
    // SERVER
    port: production ? 3000 : 3000,
    
    // DB
    db_port: typeof(process.env.HOSTNAME) == 'undefined' ? 8889 : process.env.PORT,
    db_name: production ? 'testdb' : 'testdb',
    db_username: production ? 'twothousandtimes' : 'twothousandtimes',
    db_password: production ? 'TT99**' : 'TT99**',
    
    // CDN
    cdn: production ? 'http://dncuoirsa3u02.cloudfront.net/static-test' : '',

    // EMAIL
    email: '',
    email_pass: '',
    email_subject: 'Two Thousand Times - Reservation Confirmation'
};
