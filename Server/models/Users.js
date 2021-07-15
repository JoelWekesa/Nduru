const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Users = db.define("Users", {
	first_name: DataTypes.STRING,
	last_name: DataTypes.STRING,
	email: DataTypes.STRING,
	phone: DataTypes.STRING,
	national_id: DataTypes.STRING,
	student_id: DataTypes.STRING,
	parent: DataTypes.BIGINT,
	active: DataTypes.BOOLEAN,
	admin: DataTypes.BOOLEAN,
	super_admin: DataTypes.BOOLEAN,
});

module.exports = {
	Users,
};
