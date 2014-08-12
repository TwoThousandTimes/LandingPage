/* This file simply sets up the database and any models located in this directory */


var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , config    = require('../config')
  

  //                              'database' ,       'username',         'password' 
  , sequelize = new Sequelize( config.db_name, config.db_username, config.db_password, {
      dialect: 'mysql',
      port: config.db_port
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