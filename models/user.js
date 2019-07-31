/* user model */

var Sequelize = require('sequelize');
var sequelize = require('../common/mysql');

var User = sequelize.define('user', {
	uuid: {
		type: Sequelize.STRING(128),
		primaryKey: true,
		allowNull: false
    },
    id: {
		type: Sequelize.STRING(255),
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
		type: Sequelize.STRING(20),
		allowNull: false
	}
}, {
	underscored: true,
	freezeTableName: true,
	tableName: "user"
});

module.exports = User