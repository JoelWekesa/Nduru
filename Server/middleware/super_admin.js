require("dotenv").config();
const { Users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;

const super_admin = async(req, res, next) => {
	try {
		const { access_token } = req.headers
		if(!access_token) {
			return res.status(401).json({ message: "No access token provided" });
		}

		await jwt.verify(access_token, secrets, async (err, response) => {
			if (err) {
				return res.status(403).json({ message: err.message });
			}

			const { id } = response
			await Users.findByPk(id).then(user => {
				if(!user.super_admin) {
					return res.status(401).json({ message: "Unauthorized to performm this function" });
				}

				next()
			})
		})
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

module.exports = super_admin
