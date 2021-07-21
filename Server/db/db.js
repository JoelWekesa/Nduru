require("dotenv").config();
const { Sequelize } = require("sequelize");

const { database, usernamedb, passworddb } = process.env;
const db = new Sequelize(database, usernamedb, passworddb, {
	host: "197.232.82.136",
	dialect: "postgres",
});

module.exports = {
	db,
};
