const { DataTypes } = require("sequelize");
const { db } = require("../db/db");

const Clients = db.define("Clients", {
	identifier: DataTypes.STRING,
	parent: DataTypes.BIGINT,
});

module.exports = {
	Clients,
};
