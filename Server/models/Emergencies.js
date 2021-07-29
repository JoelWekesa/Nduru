const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Emergencies = db.define("Emergencies", {
	user: DataTypes.BIGINT,
	location: DataTypes.TEXT,
	resolved: DataTypes.BOOLEAN,
	resolved_by: DataTypes.BIGINT,
	comments: DataTypes.TEXT,
	description: DataTypes.TEXT,
});

module.exports = {
	Emergencies,
};
