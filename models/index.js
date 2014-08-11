/* This file simply sets up the database and any models located in this directory */

var port = typeof(process.env.HOSTNAME) == 'undefined' ? 8889 : process.env.PORT;

var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  

  //                       'database' , 'username', 'password' 
  , sequelize = new Sequelize('testdb', 'twothousandtimes', 'TT99**', {
      dialect: 'mysql',
      port: port
  })
  
  , db        = {}

 
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })
 
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db)