require("dotenv").config();
const { Users } = require("../models/Users");
const { Respondents } = require("../models/Respondents");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;

const respondent = async (req, res, next) => {
	try {
		const token = req.headers["access-token"];
		jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(500).json({ message: err.message });
			}

			const { id } = response;
			await Users.findByPk(id)
				.then((user) => {
					const { national_id } = user;
					Respondents.findOne({ where: { national_id } })
						.then((item) => {
							if (!item) {
								return res
									.status(401)
									.json({
										message:
											"You are not authorized to respond to an incident.",
									});
							}

							next();
						})
						.catch((err) => {
							return res.status(500).json({ message: err.message });
						});
				})
				.catch((err) => {
					return res.status(500).json({ message: err.message });
				});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

module.exports = respondent
