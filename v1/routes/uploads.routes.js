import express from "express";
import {subirImagen} from "../controllers/uploads.controller.js"

const router = express.Router({ mergeParams: true })

router.post("/",subirImagen)

export default router;