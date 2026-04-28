import express from "express";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { obtenerPerfilUsuario, cambiarPlanUsuario } from "../controllers/usuarios.controllers.js";
import { cambiarPlanSchema} from "../validators/usuarios.validators.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/perfil", obtenerPerfilUsuario);
router.patch("/:id/plan", validateBodyMiddleware(cambiarPlanSchema),authorizeMiddleware(["entrenador"]), cambiarPlanUsuario);

export default router;