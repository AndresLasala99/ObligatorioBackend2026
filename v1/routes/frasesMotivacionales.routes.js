import express from "express";
import { obtenerFraseMotivacional } from "../controllers/frasesMotivacionales.controllers.js";

const router = express.Router();

router.get("/", obtenerFraseMotivacional);
export default router;