/* user model */

var Sequelize = require('sequelize');
var sequelize = require('../common/mysql');

var Session = sequelize.define('sessions', {
    session_id: {
		type: Sequelize.STRING(128),
		primaryKey: true,
		unique: true,
		allowNull: false
	},
	expires: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
	},
	data: {
		type: Sequelize.TEXT,
		allowNull: true
	}
}, {
	underscored: true,
	freezeTableName: true,
	tableName: "sessions"
});

module.exports = Session