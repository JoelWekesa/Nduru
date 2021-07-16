require("dotenv").config();
const { Router } = require("express");
const { Users } = require("../models/Users");
const { Clients } = require("../models/Clients");
const { Parents } = require("../models/Parents");
const { Codes } = require("../models/Codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = Router();

const { secrets } = process.env;

router.post("/register", async (req, res) => {
	const {
		first_name,
		last_name,
		email,
		phone,
		password,
		national_id,
		student_id,
		attached_to,
	} = req.body;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL, //Your email must have lesssecure apps enabled. https://myaccount.google.com/lesssecureapps
			pass: process.env.EMAIL_PASS,
		},
	});
	const generator = Math.floor(1000000 * Math.random()).toString();

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

	if (!password) {
		return res.status(400).json({
			message: "Please input your password.",
		});
	}

	if (!attached_to && !national_id) {
		return res.status(400).json({
			message:
				"You must provide a national_id number when not attached to a learning institution.",
		});
	}

	if (!attached_to && national_id) {
		await Users.create({
			first_name,
			last_name,
			email,
			phone,
			national_id,
			password: bcrypt.hashSync(password, 10),
		})
			.then(async (user) => {
				await transporter.sendMail(
					{
						from: '"mHealth Kenya" <support@mhealthkenya.org>',
						to: `${email}`,
						subject: "Confirmation code.",
						html: `<b style = "text-transform: capitalize"> <p>Hi ${user.first_name}, </p> <p>Your account confirmation code is ${generator}</P></b>`, // html body
					},
					async (err, data) => {
						if (err) {
							return res.status(500).json({
								error: err.message,
							});
						}

						await Codes.create({
							user: user.id,
							code: bcrypt.hashSync(`${generator}`, 10),
						})
							.then(() => {
								return res.status(200).json({
									Success: "User successfully created.",
									user,
								});
							})
							.catch((err) => {
								return res.status(500).json({ message: err.message });
							});
					}
				);
			})
			.catch((err) => {
				return res.status(500).json({
					message: err.message,
				});
			});
	}

	if (attached_to) {
		await Parents.findOne({
			where: {
				name: attached_to,
			},
		}).then(async (parent) => {
			await Clients.findOne({
				where: {
					identifier: student_id
						? student_id
						: national_id
						? national_id
						: "None",
					id: parent.id,
				},
			})
				.then((client) => {
					if (!client) {
						return res.status(403).json({
							message: `You are not allowed to register under ${parent.name}`,
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
						password: bcrypt.hashSync(password, 10),
					})
						.then(async (user) => {
							await transporter.sendMail(
								{
									from: '"mHealth Kenya" <support@mhealthkenya.org>',
									to: `${email}`,
									subject: "Confirmation code.",
									html: `<b style = "text-transform: capitalize"> <p>Hi ${user.first_name}, </p> <p>Your account confirmation code is ${generator}</P></b>`, // html body
								},
								async (err, data) => {
									if (err) {
										return res.status(500).json({
											error: err.message,
										});
									}

									await Codes.create({
										user: user.id,
										code: bcrypt.hashSync(`${generator}`, 10),
									})
										.then(() => {
											return res.status(200).json({
												Success: "User successfully created.",
												user,
											});
										})
										.catch((err) => {
											return res.status(500).json({ message: err.message });
										});
								}
							);
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
	}
});

router.put("/activate", async (req, res) => {
	const { email, code } = req.body;
	if (!email) {
		return res.status(400).json({ message: "Please enter a valid email" });
	}

	if (!code) {
		return res.status(400).json({ message: "Please enter a valid code" });
	}
	Users.findOne({ where: { email } }).then(async (user) => {
		if (!user) {
			return res.status(400).json({
				message: "Invalid email address",
			});
		}

		const { id } = user;
		await Codes.findOne({ where: { user: id } })
			.then(async (item) => {
				if (!item) {
					return res.status(404).json({
						message: "You do not have a confirmation code.",
					});
				}

				const valid = bcrypt.compareSync(code, item.code);
				if (!valid) {
					return res.status(403).json({
						message: "Invalid confirmation code",
					});
				}
				await Users.update(
					{ active: true },
					{
						where: {
							id,
						},
					}
				)
					.then(async (item) => {
						Codes.destroy({ where: { user: id } })
							.then(() => {
								return res.status(200).json({
									Success: "Account activated.",
								});
							})
							.catch((err) => {
								return res.status(500).json({ message: err.message });
							});
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	});
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email) {
		return res.status(400).json({ message: "Please enter a valid email" });
	}

	if (!password) {
		return res.status(400).json({ message: "Please enter your password" });
	}

	await Users.findOne({ where: { email } }).then((user) => {
		if (!user) {
			return res.status(404).json({ message: "Invalid email address" });
		}
		if (!user.active) {
			return res
				.status(400)
				.json({ message: "Please verify your account before logging in" });
		}
		const valid = bcrypt.compareSync(password, user.password);
		if (!valid) {
			return res.status(400).json({ message: "Invalid password" });
		}
		const token = jwt.sign({ id: user.id }, secrets, { expiresIn: "8h" });
		return res.status(200).json({ user, token });
	});
});

module.exports = router;
