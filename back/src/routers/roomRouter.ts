import express from "express";
import * as roomController from "../controllers/roomController";

const router = express.Router();

router.route("/").get(roomController.createRoom);
router.route("/:id").post(roomController.joinRoom);

export default router;
