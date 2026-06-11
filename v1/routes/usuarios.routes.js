import express from "express";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { obtenerPerfilUsuario, cambiarPlanUsuario, actualizarFotoPerfilUsuario, cambiarPasswordUsuario, obtenerEntrenadores } from "../controllers/usuarios.controllers.js";
import { cambiarPlanSchema, actualizarFotoPerfilSchema, cambiarPasswordSchema} from "../validators/usuarios.validators.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/perfil", obtenerPerfilUsuario);
router.get("/entrenadores", obtenerEntrenadores);
router.patch("/perfil/foto", validateBodyMiddleware(actualizarFotoPerfilSchema), actualizarFotoPerfilUsuario);
router.patch("/perfil/password", validateBodyMiddleware(cambiarPasswordSchema), cambiarPasswordUsuario);
router.patch("/:id/plan", validateBodyMiddleware(cambiarPlanSchema),authorizeMiddleware(["entrenador"]), cambiarPlanUsuario);

export default router;
