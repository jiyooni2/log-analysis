import express from "express";

import transferRouter from "./routers/transferRouter.js";

const app = express();

app.set("view engine", "ejs");
app.use("/transfer", transferRouter);
app.use("/data", express.static("data"));

const PORT = 3000;

const handleListening = () => {
  console.log(`The server is listening on http://localhost:${PORT}`);
};

app.listen(PORT, handleListening);
