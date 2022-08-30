import express from "express";

import { getTransfer } from "../controllers/transferController.js";

const transferRouter = express.Router();

transferRouter.get("/", getTransfer);

export default transferRouter;
