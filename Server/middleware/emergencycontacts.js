require("dotenv").config();
const { Router } = require("express");
const { EmergencyContacts } = require("../models/EmergencyContacts");
const { Users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;

const fetchers = async (req, res, next) => {
	const { access_token } = req.headers;
	const { id } = req.params;
	if (!access_token) {
		return res.status(403).json({ message: "No access token provided." });
	}

	await jwt.verify(access_token, secrets, async (err, response) => {
		if (err) {
			return res.status(403).json({ message: err.message });
		}

		await EmergencyContacts.findAll()
	});
};

module.exports = fetchers;
