import express from "express";
import dotenv from "dotenv";
dotenv.config({
	path: `${__dirname}/../config.env`,
});
const app = express();
const PORT = process.env.PORT;

app.get("/", (_, res) => {
	res.status(200).json({
		message: "Hello World",
	});
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
