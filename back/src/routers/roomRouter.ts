import express from "express";
import * as roomController from "../controllers/roomController";

const router = express.Router();

router.route("/").get(roomController.createRoom);
router.route("/join").get(roomController.joinRoom);

export default router;
