import express from "express";
import * as roomController from "../controllers/roomController";

const router = express.Router();

router.route("/").get(roomController.joinRoom);
router.route("/").post(roomController.createRoom);

export default router;
