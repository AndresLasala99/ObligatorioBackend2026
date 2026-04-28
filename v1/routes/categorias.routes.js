import express from "express";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { obtenerCategorias, crearCategoria, obtenerCategoriaPorId, actualizarCategoria, eliminarCategoria } from "../controllers/categorias.controllers.js";
import { agregarCategoriaSchema,modificarCategoriaSchema } from "../validators/categorias.validators.js"
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", obtenerCategorias);
router.post("/", validateBodyMiddleware(agregarCategoriaSchema), authorizeMiddleware(["entrenador"]), crearCategoria);
router.get("/:id", obtenerCategoriaPorId);
router.patch("/:id", validateBodyMiddleware(modificarCategoriaSchema),authorizeMiddleware(["entrenador"]), actualizarCategoria);
router.delete("/:id", authorizeMiddleware(["entrenador"]), eliminarCategoria);


export default router;