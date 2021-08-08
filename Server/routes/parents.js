const { Router } = require("express");
const { Parents } = require("../models/Parents");

const router = Router();

router.get("/all", (req, res) => {
	try {
		Parents.findAll()
			.then((parents) => {
				return res.status(200).json({ parents });
			})
			.catch((err) => {
				return res.status(400).json({ message: err.message });
			});
	} catch (e) {
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;
