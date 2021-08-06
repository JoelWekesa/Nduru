const { Router } = require("express");
const { PanicEmergencies } = require("../models/Panic");

const router = Router();

router.post("/add", (req, res) => {
	try {
		const { location, device } = req.body;
		if (!location) {
			return res.status(400).json({
				message:
					"Please activate our location and allow app to access your location",
			});
		}
		if (!device) {
			return res
				.status(400)
				.json({ message: "Your device could not be accessed" });
		}

		PanicEmergencies.create({
			location,
			device,
		})
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

router.get("/all", (req, res) => {
	try {
		PanicEmergencies.findAndCountAll()
			.then((panic) => {
				const data = panic;
				return res.status(200).json({ data });
			})
			.catch((err) => {
				return res.status(400).json({ message: err.message });
			});
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
});

module.exports = router;
