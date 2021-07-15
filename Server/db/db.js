require("dotenv").config();
const { Sequelize } = require("sequelize");

const { database, usernamedb, passworddb } = process.env;
const db = new Sequelize(database, usernamedb, passworddb, {
	host: "192.168.0.20",
	dialect: "postgres",
});

module.exports = {
	db,
};
