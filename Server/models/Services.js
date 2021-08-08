const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Services = db.define("Services", {
	provider: DataTypes.BIGINT,
	name: DataTypes.STRING,
	description: DataTypes.STRING,
	added_by: DataTypes.BIGINT,
});

module.exports = {
	Services,
};
