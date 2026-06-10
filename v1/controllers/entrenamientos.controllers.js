import { actualizarEntrenamientoService, crearEntrenamientoService, eliminarEntrenamientoService, obtenerEntrenamientosService, obtenerEntrenamientoPorIdService, obtenerMisEntrenamientosService, obtenerMisEstadisticasService } from "../services/entrenamientos.services.js";

export const obtenerEntrenamientos = async (req, res) => {
    const { page, limit, nivel, categoria, titulo, disponibles, entrenador } = req.query;
    const resultado = await obtenerEntrenamientosService(page,limit,nivel,categoria,titulo,disponibles,entrenador);
    res.json({message: "Obtener todos los entrenamientos.",...resultado});
};

export const obtenerMisEntrenamientos = async (req, res) => {
    const { page, limit, nivel, categoria, titulo, tipo } = req.query;
    const resultado = await obtenerMisEntrenamientosService(req.decoded.id,page,limit,nivel,categoria,titulo,tipo);
    res.json({message: "Obtener entrenamientos del entrenador logueado.",...resultado});
};

export const obtenerMisEstadisticas = async (req, res) => {
    const resultado = await obtenerMisEstadisticasService(req.decoded.id);
    res.json({message: "Obtener estadísticas del entrenador logueado.",...resultado});
};

export const crearEntrenamiento = async (req, res) => {
    const entrenamientoCreado = await crearEntrenamientoService(req.body, req.decoded.id);
    res.status(201).json({ message: "Entrenamiento creado correctamente.", entrenamiento: entrenamientoCreado });
}

export const obtenerEntrenamientoPorId = async (req, res) => {
    const { id } = req.params;
    const entrenamientoBuscado = await obtenerEntrenamientoPorIdService(id);
    res.json({ message: `Obtener entrenamiento con ID: ${id}.`, entrenamientoBuscado });
}

export const actualizarEntrenamiento = async (req, res) => {
    const { id } = req.params;
    const entrenamientoActualizado = await actualizarEntrenamientoService(id,req.body,req.decoded.id);
    res.json({message: `Entrenamiento con ID ${id} actualizado.`,entrenamientoActualizado});
};

export const eliminarEntrenamiento = async (req, res) => {
    const { id } = req.params;
    await eliminarEntrenamientoService(id, req.decoded.id);
    res.json({message: "Entrenamiento eliminado correctamente."});
};

