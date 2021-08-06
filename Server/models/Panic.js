const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const PanicEmergencies = db.define("PanicEmergencies", {
	device: DataTypes.JSON,
	location: DataTypes.JSON,
	resolved: DataTypes.BOOLEAN,
	resolved_by: DataTypes.BIGINT,
});

module.exports = {
	PanicEmergencies,
};
