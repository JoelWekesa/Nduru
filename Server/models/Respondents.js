const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Respondents = db.define("Respondents", {
	provider: DataTypes.BIGINT,
	first_name: DataTypes.STRING,
	last_name: DataTypes.STRING,
	email: DataTypes.STRING,
	phone: DataTypes.STRING,
	national_id: DataTypes.STRING,
	cadre: DataTypes.STRING,
	active: DataTypes.BOOLEAN,
});

module.exports = {
	Respondents,
};
