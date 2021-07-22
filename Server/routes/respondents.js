require("dotenv").config();
const { Router } = require("express");
const { Users } = require("../models/Users");
const { Respondents } = require("../models/Respondents");
const { Providers } = require("../models/Providers");
const { Codes } = require("../models/Codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { secrets } = process.env;

const router = Router();
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL, //Your email must have lesssecure apps enabled. https://myaccount.google.com/lesssecureapps
		pass: process.env.EMAIL_PASS,
	},
});

//? Add respondent

router.post("/add", async (req, res) => {
	try {
		const { access_token } = req.headers;
		const { first_name, last_name, email, phone, national_id, cadre } =
			req.body;
		if (!access_token) {
			return res.status(401).json({ message: "No access token provided" });
		}
		if (
			!first_name ||
			!last_name ||
			!email ||
			!phone ||
			!national_id ||
			!cadre
		) {
			return res.status(400).json({ message: "Please fill all fields." });
		}
		await jwt.verify(access_token, secrets, async (err, response) => {
			if (err) {
				return res.status(401).json({ message: err.message });
			}

			const { id } = response;
			await Providers.findOne({
				where: {
					admin: id,
				},
			})
				.then(async (provider) => {
					if (!provider) {
						return res.status(400).json({
							message: "You are not listed as a service provider admin.",
						});
					}
					await Users.findOne({ where: { email, phone, national_id } }).then(
						async (user) => {
							if (!user) {
								return res.status(400).json({
									message:
										"Please ensure the responder you are trying to add is a registered user.",
								});
								// const generator = Math.floor(
								// 	9000000 * Math.random()
								// ).toString();
								// await Users.create({
								// 	first_name,
								// 	last_name,
								// 	email,
								// 	phone,
								// 	national_id,
								// 	active: true,
								// 	respondent: true,
								// 	password: bcrypt.hashSync(generator, 10),
								// })
								// 	.then(async (item) => {
								// 		await Respondents.create({
								// 			provider: provider.id,
								// 			first_name,
								// 			last_name,
								// 			email,
								// 			phone,
								// 			national_id,
								// 			cadre,
								// 		})
								// 			.then(async (respondent) => {
								// 				await Codes.create({
								// 					user: item.id,
								// 					code: bcrypt.hashSync(generator, 10),
								// 				})
								// 					.then(async () => {
								// 						await transporter.sendMail(
								// 							{
								// 								from: '"mHealth Kenya" <support@mhealthkenya.org>',
								// 								to: `${email}`,
								// 								subject: "Respondent confirmation.",
								// 								html: `<b style = "text-transform: capitalize"> <p>Hi, </p> <p>You have been added as an incidents responder by ${provider.name} </P> <p>Your account password and confirmation code is ${generator}</P> <p>You can choose to keep this password or change it.</p></b>`, // html body
								// 							},
								// 							async (err, data) => {
								// 								if (err) {
								// 									return res
								// 										.status(400)
								// 										.json({ message: err.message });
								// 								}
								// 								return res.status(200).json({
								// 									message:
								// 										"Successfully created added to response team.",
								// 								});
								// 							}
								// 						);
								// 					})
								// 					.catch((err) => {
								// 						return res
								// 							.status(500)
								// 							.json({ message: err.message });
								// 					});
								// 			})
								// 			.catch((err) => {
								// 				return res.status(500).json({ message: err.message });
								// 			});
								// 	})
								// 	.catch((err) => {
								// 		return res.status(500).json({ message: err.message });
								// 	});
							}

							const generator = Math.floor(9000000 * Math.random()).toString();

							user
								.update({ respondent: true })
								.then(async (person) => {
									await Respondents.create({
										provider: provider.id,
										first_name: person.first_name,
										last_name: person.last_name,
										email: person.email,
										phone: person.phone,
										national_id: person.national_id,
										cadre,
									})
										.then(async () => {
											await Codes.destroy({ where: { user: user.id } })
												.then(async () => {
													await Codes.create({
														user: user.id,
														code: bcrypt.hashSync(generator, 10),
													})
														.then(async () => {
															await transporter.sendMail(
																{
																	from: '"mHealth Kenya" <support@mhealthkenya.org>',
																	to: `${email}`,
																	subject: "Respondent confirmation.",
																	html: `<b style = "text-transform: capitalize"> <p>Hi, </p> <p>You have been added as an incidents responder by ${provider.name} </P> <p>Your account password and confirmation code is ${generator}</P> <p>You can choose to keep this password or change it.</p></b>`, // html body
																},
																async (err, data) => {
																	if (err) {
																		return res.status(400).json({
																			message: err.message,
																		});
																	}
																	return res.status(200).json({
																		message:
																			"Successfully added to response team.",
																	});
																}
															);
														})
														.catch((err) => {
															return res
																.status(500)
																.json({ message: err.message });
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
						}
					);
				})
				.catch((err) => {
					return res.status(500).json({ message: err.message });
				});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message, val: 6 });
	}
});

//? Activate account

router.put("/activate", async (req, res) => {
	try {
		const { access_token } = req.headers;
		const { code } = req.body;
		if (!access_token) {
			return res.status(401).json({ message: "No access token provided" });
		}

		if (!code) {
			return res.status(400).json({ message: "Please input activation code." });
		}

		await jwt.verify(access_token, secrets, async (err, response) => {
			if (err) {
				return res.status(401).json({ message: err.message });
			}

			const { id } = response;
			await Users.findByPk(id)
				.then(async (user) => {
					await Codes.findAll({ where: { user: user.id } })
						.then(async (codes) => {
							if (codes.length === 0) {
								return res.status(400).json({
									message: "You do not have a reset code. Please generate one.",
								});
							}

							const current = codes[codes.length - 1];
							const valid = await bcrypt.compareSync(code, current.code);
							if (!valid) {
								return res
									.status(401)
									.json({ message: "Invalid confirmation code." });
							}

							Respondents.findOne({
								where: { national_id: user.national_id },
							})
								.then((respondent) => {
									if (!respondent) {
										return res.status(404).json({
											message: "You are yet to be added as a respondent",
										});
									}

									respondent
										.update({ active: true })
										.then(() => {
											Codes.destroy({ where: { user: user.id } })
												.then(() => {
													return res.status(200).json({
														message:
															"Respondent account successfully activated",
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
});

module.exports = router;
