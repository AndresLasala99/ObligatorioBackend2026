import express from "express";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { obtenerEntrenamientos, crearEntrenamiento, obtenerEntrenamientoPorId, actualizarEntrenamiento, eliminarEntrenamiento, obtenerMisEntrenamientos, obtenerMisEstadisticas } from "../controllers/entrenamientos.controllers.js";
import { agregarEntrenamientoSchema,modificarEntrenamientoSchema } from "../validators/entrenamientos.validators.js"
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import esDueñoEntrenamiento from "../middlewares/esDueñoEntrenamiento.js";

const router = express.Router({ mergeParams: true });

router.get("/", obtenerEntrenamientos);
router.post("/",validateBodyMiddleware(agregarEntrenamientoSchema), authorizeMiddleware(["entrenador"]), crearEntrenamiento);
router.get("/mis-estadisticas", authorizeMiddleware(["entrenador"]), obtenerMisEstadisticas);
router.get("/mis-entrenamientos", authorizeMiddleware(["entrenador"]), obtenerMisEntrenamientos);
router.get("/:id", obtenerEntrenamientoPorId);
router.patch("/:id", validateBodyMiddleware(modificarEntrenamientoSchema), authorizeMiddleware(["entrenador"]),esDueñoEntrenamiento, actualizarEntrenamiento);
router.delete("/:id", authorizeMiddleware(["entrenador"]), esDueñoEntrenamiento, eliminarEntrenamiento);

export default router;
