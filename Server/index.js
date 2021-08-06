const express = require("express");
const cors = require("cors");
const { json, urlencoded } = require("express");
const { db } = require("./db/db");
const usersAPI = require("./routes/users");
const emergencyContactsAPI = require("./routes/emergencycontacts");
const providersAPI = require("./routes/providers");
const respondentsAPI = require("./routes/respondents");
const emergenciesAPI = require("./routes/emergencies");
const panicEmergencies = require("./routes/panic");

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

//? APIs
app.use("/api/users", usersAPI);
app.use("/api/contacts", emergencyContactsAPI);
app.use("/api/providers", providersAPI);
app.use("/api/respondents", respondentsAPI);
app.use("/api/emergencies", emergenciesAPI);
app.use("/api/panic", panicEmergencies);

const PORT = process.env.PORT || 5000;

try {
	db.authenticate();
	console.log("Connection has been established successfully.");
} catch (error) {
	console.error("Unable to connect to the database:", error);
}

app.listen(PORT, (err) => {
	if (err) throw err;
	console.log("Server running");
});
