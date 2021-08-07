require("dotenv").config();
const { Router } = require("express");
const { EmergencyContacts } = require("../models/EmergencyContacts");
const { Users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;

const router = Router();

//? Add emergency contacts

router.post("/add", async (req, res) => {
	try {
		const { access_token } = req.headers;
		const {
			contact_name,
			contact_phone,
			contact_location,
			contact_relationship,
			priority,
		} = req.body;
		if (
			!contact_name ||
			!contact_phone ||
			!contact_location ||
			!contact_relationship
		) {
			return res.status(400).json({ message: "Please fill all fields." });
		}
		if (!access_token) {
			return res.status(400).json({ message: "No access token provided" });
		}
		await jwt.verify(access_token, secrets, (err, response) => {
			if (err) {
				return res.status(403).json({ message: err.message });
			}
			const { id } = response;
			Users.findByPk(id)
				.then(async (user) => {
					await EmergencyContacts.findAndCountAll({ where: { user: user.id } })
						.then(async (contacts) => {
							const { count } = contacts;
							if (count >= 5) {
								return res
									.status(400)
									.json({ message: "Maximum number of contacts reached." });
							}

							await EmergencyContacts.create({
								user: user.id,
								contact_name,
								contact_phone,
								contact_location,
								contact_relationship,
								priority,
							})
								.then((contact) => {
									return res.status(200).json({
										message: "Emergency contact successfully created",
										contact,
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

//? User Emergency contacts

router.get("/all/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await Users.findByPk(id).then(async (item) => {
			if (!item) {
				return res.status(400).json({ message: "Invalid user ID" });
			}

			const { access_token } = req.headers;
			if (!access_token) {
				return res.status(403).json({ message: "No access token provided" });
			}

			await jwt.verify(access_token, secrets, async (err, response) => {
				if (err) {
					return res.status(401).json({ message: err.message });
				}

				const requester = response.id;

				await EmergencyContacts.findAll({
					where: { user: id },
					order: [
						["priority", "DESC"],
						["id", "DESC"],
					],
				})
					.then(async (contacts) => {
						await Users.findByPk(requester)
							.then(async (user) => {
								if (user.id !== id && !user.respondent) {
									return res.status(403).json({
										message:
											"You are not authorized to view contacts you are not associated with",
									});
								}

								return res.status(200).json({ contacts });
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
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Edit emergency contacts

router.put("/edit/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers["access-token"];
		const {
			contact_name,
			contact_phone,
			contact_location,
			contact_relationship,
			priority,
		} = req.body;
		await EmergencyContacts.findByPk(id).then(async (contact) => {
			if (!contact) {
				return res.status(404).json({ message: "Invalid contact id" });
			}

			jwt.verify(token, secrets, (err, response) => {
				if (err) {
					return res.status(403).json({ message: err.message });
				}

				const user = response.id;
				if (contact.user !== user) {
					return res.status(403).json({
						message:
							"You cannot edit emergency contacts you are not associated with",
					});
				}

				contact
					.update({
						contact_name: contact_name ? contact_name : contact_name,
						contact_phone: contact_phone ? contact_phone : contact_phone,
						contact_location: contact_location
							? contact_location
							: contact_location,
						contact_relationship: contact_relationship
							? contact_relationship
							: contact_relationship,
						priority: priority ? priority : priority,
					})
					.then(() => {
						return res
							.status(200)
							.json({ message: "Contact was successfully updated." });
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Delete emergency contact

router.delete("/delete/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { access_token } = req.headers;
		await EmergencyContacts.findByPk(id).then(async (contact) => {
			if (!contact) {
				return res.status(404).json({ message: "Invalid contact id" });
			}

			jwt.verify(access_token, secrets, (err, response) => {
				if (err) {
					return res.status(403).json({ message: err.message });
				}

				const user = response.id;
				if (contact.user !== user) {
					return res.status(403).json({
						message:
							"You cannot delete emergency contacts you are not associated with",
					});
				}

				contact
					.destroy()
					.then(() => {
						return res
							.status(200)
							.json({ message: "Contact was successfully deleted." });
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;
