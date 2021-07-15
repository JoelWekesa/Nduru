const { Router } = require("express");
const { Users } = require("../models/Users");
const { Clients } = require("../models/Clients");
const bcrypt = require("bcryptjs");

const router = Router();

router.post("/register", (req, res) => {
	const {
		first_name,
		last_name,
		email,
		phone,
		location,
		national_id,
		student_id,
	} = req.body;

	if (!first_name) {
		return res.status(400).json({
			message: "Please input your first name.",
		});
	}
	if (!last_name) {
		return res.status(400).json({
			message: "Please input your last_name.",
		});
	}
	if (!email) {
		return res.status(400).json({
			message: "Please input your email.",
		});
	}
	if (!phone) {
		return res.status(400).json({
			message: "Please input your phone number.",
		});
	}

	Clients.findOne({
		where: {
			identifier: student_id ? student_id : national_id ? national_id : "None",
		},
	})
		.then((client) => {
			if (!client) {
				Users.create({
					first_name,
					last_name,
					email,
					phone,
					password: bcrypt.hashSync(
						Math.floor(1000000 * Math.random()).toString(),
						10
					),
				})
					.then((user) => {
						return res.status(200).json({
							message: "Successfully registered as a user.",
							user,
						});
					})
					.catch((err) => {
						return res.status(500).json({
							message: err.message,
						});
					});
			}

			Users.create({
				first_name,
				last_name,
				email,
				phone,
				parent: parseInt(client.parent),
				student_id,
				national_id,
				password: bcrypt.hashSync(
					Math.floor(1000000 * Math.random()).toString(),
					10
				),
			})
				.then((user) => {
					return res.status(200).json({
						message: "Successfully registered as a user.",
						user,
					});
				})
				.catch((err) => {
					return res.status(500).json({
						message: err.message,
					});
				});
		})
		.catch((err) => {
			return res.status(500).json({
				message: err.message,
			});
		});
});

module.exports = router;
