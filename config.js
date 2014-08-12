'use strict';

var production = process.env.NODE_ENV === 'production';

module.exports = {
    port: production ? 21137 : 3000,
    db_port: typeof(process.env.HOSTNAME) == 'undefined' ? 8889 : process.env.PORT,
    db_name: production ? 'testdb' : 'testdb',
    db_username: production ? 'twothousandtimes' : 'twothousandtimes',
    db_password: production ? 'TT99**' : 'TT99**',
    cdn: production ? 'cdn:' : ''
};
