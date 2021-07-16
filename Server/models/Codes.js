const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Codes = db.define("Codes", {
	user: DataTypes.BIGINT,
	code: DataTypes.TEXT,
});

module.exports = {
	Codes,
};
