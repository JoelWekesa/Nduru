const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Parents = db.define("Parents", {
	name: DataTypes.STRING,
});

module.exports = {
	Parents,
};
