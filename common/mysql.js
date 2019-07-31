/* Sequelize mysql */
var config = require('../config');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(
	config.mysqlConfig.mysql.database,
	config.mysqlConfig.mysql.username,
    config.mysqlConfig.mysql.password, 
    {
		host: config.mysqlConfig.mysql.host,
		dialect: 'mysql'
	}
);

module.exports = sequelize;