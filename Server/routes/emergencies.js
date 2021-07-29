const { Router } = require("express");
const { Emergencies } = require("../models/Emergencies");
const { Users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;
const respondent = require("../middleware/respondent");

const router = Router();

//? Report Emergency

router.post("/add", async (req, res) => {
	try {
		const token = req.headers["access-token"];
		const { location, description } = req.body;
		await jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(400).json({ message: err.message });
			}

			const { id } = response;

			await Emergencies.create({
				user: id,
				location: location ? location : null,
				description: description ? description : null,
			})
				.then((emergency) => {
					return res.status(200).json({ message: emergency });
				})
				.catch((err) => {
					return res.status(400).json({ message: err.message });
				});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Resolve emergency

router.put("/resolve/:id", [respondent], async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers["access-token"];
		const { comments } = req.body;
		await jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(500).json({ message: err.message });
			}

			const user = response["id"];

			await Emergencies.findByPk(id)
				.then(async (emergency) => {
					if (!emergency) {
						return res.status(404).json({
							message: "Emergency with the provided id is yet to be reported.",
						});
					}

					emergency
						.update({
							comments: comments ? comments : null,
							resolved: true,
							resolved_by: user,
						})
						.then(() => {
							return res
								.status(200)
								.json({ message: "Emergency successfully resolved" });
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

//? Get specific emergency

router.get("/emergency/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await Emergencies.findByPk(id)
			.then((emergency) => {
				return res.status(200).json({ emergency });
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Get all emergencies

router.get("/all", async (req, res) => {
	try {
		await Emergencies.findAndCountAll()
			.then((emergencies) => {
				return res.status(200).json({ emergencies });
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Get my emergencies

router.get("/my/emergencies", async (req, res) => {
	try {
		const token = req.headers["access-token"];
		await jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(401).json({ message: err.message });
			}

			const { id } = response;
			await Emergencies.findAndCountAll({ where: { user: id } })
				.then((emergencies) => {
					return res.status(200).json({ emergencies });
				})
				.catch((err) => {
					return res.status(500).json({ message: err.message });
				});
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Respondent to get user emergencies.

router.get("/user/:id", async (req, res) => {
	try {
		const token = req.headers["access-token"];
		const raiser = req.params.id;
		await jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(401).json({ message: err.message });
			}

			const { id } = response;
			Users.findByPk(id).then(async (user) => {
				if (!user.respondent) {
					return res.status(401).json({
						message: "You are not authorized to access this service.",
					});
				}

				await Emergencies.findAndCountAll({ where: { user: raiser } })
					.then((emergencies) => {
						return res.status(200).json({ emergencies });
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
