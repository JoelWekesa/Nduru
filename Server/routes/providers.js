require("dotenv").config();
const { Router } = require("express");
const { Users } = require("../models/Users");
const { Providers } = require("../models/Providers");
const super_admin = require("../middleware/super_admin");

const router = Router();

//? Add provider

router.post("/add", [super_admin], async (req, res) => {
	try {
		const { name, admin } = req.body;
		if (!admin) {
			return res.status(400).json({ message: "Please select facility admin" });
		}
		if (!name) {
			return res.status(400).json({ message: "Please enter a name" });
		}

		await Users.findByPk(admin)
			.then((user) => {
				if (!user) {
					return res
						.status(400)
						.json({ message: "Invalid user selected as admin" });
				}

				Providers.create({
					name,
					admin,
				})
					.then(() => {
						return res
							.status(200)
							.json({ message: "Provider successfully added" });
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Edit provider

router.put("/edit", [super_admin], async (req, res) => {
	try {
		const { name, new_name, new_admin } = req.body;
		if (!name) {
			return res.status(400).json({
				message: "Please input the name of the provider you want to edit.",
			});
		}
		await Providers.findOne({ where: { name } })
			.then(async (provider) => {
				if (!provider) {
					return res
						.status(404)
						.json({ message: "A provider with the name is yet to be added." });
				}

				await provider
					.update({
						name: new_name ? new_name : provider.name,
						admin: new_admin ? new_admin : provider.admin,
					})
					.then(() => {
						return res
							.status(200)
							.json({ message: "Provider details successfully updated." });
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Delete provider

router.delete("/delete", [super_admin], async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) {
			return res.status(400).json({
				message: "Please enter a name of the provider you want to delete.",
			});
		}

		await Providers.findOne({ where: { name } })
			.then(async (provider) => {
				if (!provider) {
					return res.status(404).json({
						message: "Provider with the provided name does not exist.",
					});
				}

				await provider
					.destroy()
					.then(() => {
						return res
							.status(200)
							.json({ message: "Provider was successfully deleted." });
					})
					.catch((err) => {
						return res.status(500).json({ message: err.message });
					});
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

//? Get all providers

router.get("/all", async (req, res) => {
	try {
		Providers.findAndCountAll()
			.then((providers) => {
				return res.status(200).json({ providers });
			})
			.catch((err) => {
				return res.status(500).json({ message: err.message });
			});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;
