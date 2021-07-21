const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const EmergencyContacts = db.define("EmergencyContacts", {
	user: DataTypes.BIGINT,
	contact_name: DataTypes.STRING,
	contact_phone: DataTypes.STRING,
	contact_location: DataTypes.STRING,
	contact_relationship: DataTypes.STRING,
	priority: DataTypes.BOOLEAN,
});

module.exports = {
	EmergencyContacts,
};
