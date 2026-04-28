import express from "express";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { registrarUsuario, loginUsuario } from "../controllers/auth.controllers.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";

const router = express.Router({ mergeParams: true })

router.post("/registro", validateBodyMiddleware(registerSchema), registrarUsuario);
router.post("/login", validateBodyMiddleware(loginSchema), loginUsuario);

export default router;