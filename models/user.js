/* user model */

var Sequelize = require('sequelize');
var sequelize = require('../common/mysql');

var User = sequelize.define('user', {
	idx: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false
    },
    id: {
		type: Sequelize.STRING(30),
		primaryKey: true,
		unique: true,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING(255),
		allowNull: false,
	},
	guid: {
		type: Sequelize.STRING(255),
		allowNull: true
	},
	name: {
		type: Sequelize.STRING(50),
		allowNull: false
	}
}, {
	underscored: true,
	freezeTableName: true,
	tableName: "user"
});

module.exports = User