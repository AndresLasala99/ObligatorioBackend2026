import express from "express"
import { authenticateMiddleware } from "./middlewares/authenticate.middleware.js";
import entrenamientosRouter  from "./routes/entrenamientos.routes.js"
import categoriasRouter from "./routes/categorias.routes.js"
import usuariosRouter from "./routes/usuarios.routes.js"
import authRouter from "./routes/auth.routes.js"
import inscripcionesRouter from "./routes/inscripciones.routes.js"
import motivacionRouter from "./routes/frasesMotivacionales.routes.js";
import aiRouter from "./routes/ai.routes.js"
import uploadsRouter from "./routes/uploads.routes.js"

const router = express.Router({ mergeParams: true })

//rutas desprotegidas
router.use("/auth", authRouter);

//middleware para verificar token
router.use(authenticateMiddleware);

//rutas protegidas
router.use("/entrenamientos", entrenamientosRouter);
router.use("/categorias", categoriasRouter);
router.use("/usuarios", usuariosRouter);
router.use("/inscripciones", inscripcionesRouter)
router.use("/motivacion", motivacionRouter);
router.use("/ai",aiRouter);
router.use("/uploads", uploadsRouter);

export default router;