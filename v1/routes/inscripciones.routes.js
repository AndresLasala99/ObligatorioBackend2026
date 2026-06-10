import express from "express";
import { inscribirseAEntrenamiento, eliminarInscripcion, obtenerMisInscripciones, obtenerMisEstadisticasCliente } from "../controllers/inscripciones.controllers.js";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { inscripcionSchema } from "../validators/inscripciones.validators.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/",validateBodyMiddleware(inscripcionSchema), authorizeMiddleware(["cliente"]), inscribirseAEntrenamiento);
router.delete("/entrenamiento/:id", authorizeMiddleware(["cliente"]), eliminarInscripcion);
router.get("/mis-estadisticas", authorizeMiddleware(["cliente"]), obtenerMisEstadisticasCliente);
router.get("/misinscripciones", authorizeMiddleware(["cliente"]), obtenerMisInscripciones);

export default router;
