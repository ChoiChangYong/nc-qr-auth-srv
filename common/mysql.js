/* Sequelize mysql */
var config = require('../config');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(
	config.config.mysql.database,
	config.config.mysql.username,
    config.config.mysql.password, 
    {
		host: config.config.mysql.host,
		dialect: 'mysql'
	}
);

module.exports = sequelize;