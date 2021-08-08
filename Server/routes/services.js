require("dotenv").config();
const { Router } = require("express");
const { Services } = require("../models/Services");
const { Providers } = require("../models/Providers");
const jwt = require("jsonwebtoken");
const { secrets } = process.env;
const router = Router();

//? Get all services
router.get("/all", async (req, res) => {
	try {
		await Services.findAndCountAll()
			.then((services) => {
				return res.status(200).json({ services });
			})
			.catch((err) => {
				return res.status(400).json({ message: err.message });
			});
	} catch (e) {
		return res.status(500).json({ message: err.message });
	}
});

//? Add service

router.post("/add", async (req, res) => {
	try {
		const { name, description } = req.body;
		const token = req.headers["access-token"];

		if (!name) {
			return res.status(400).json({ message: "Name of service is required" });
		}

		await jwt.verify(token, secrets, async (err, response) => {
			if (err) {
				return res.status(401).json({ message: err.message });
			}

			const { id } = response;
			Providers.findOne({ where: { admin: id } })
				.then(async (provider) => {
					if (!provider) {
						return res.status(400).json({
							message: "You must be a service provider to add a service",
						});
					}
					await Services.create({
						provider: provider.id,
						name,
						description,
						added_by: id,
					})
						.then((service) => {
							return res.status(200).json({ service });
						})
						.catch((err) => {
							return res.status(400).json({ message: err.message });
						});
				})
				.catch((err) => {
					return res.status(404).json({ message: err.message });
				});
		});
	} catch (e) {
		return res.status(500).json({ message: err.message });
	}
});

//? Get provider services

router.get("/all/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await Services.findAndCountAll({ where: { provider: id } })
			.then((services) => {
				return res.status(200).json({ services });
			})
			.catch((err) => {
				return res.status(400).json({ message: err.message });
			});
	} catch (e) {
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;
