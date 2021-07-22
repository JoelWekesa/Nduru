require("dotenv").config();
const { Router } = require("express");
const { Users } = require("../models/Users");
const { Providers } = require("../models/Providers");
const super_admin = require("../middleware/super_admin");

const router = Router();

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

module.exports = router;
