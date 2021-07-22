const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Providers = db.define("Providers", {
	name: DataTypes.STRING,
	admin: DataTypes.BIGINT,
});

module.exports = {
	Providers,
};
