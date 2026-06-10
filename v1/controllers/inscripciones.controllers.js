import { inscribirseAEntrenamientoService,eliminarInscripcionService,obtenerMisInscripcionesService, obtenerMisEstadisticasClienteService } from "../services/inscripciones.services.js";

export const inscribirseAEntrenamiento = async (req, res) => {
    const { idEntrenamiento } = req.body;
    const idUsuario = req.decoded.id;
    const inscripcion = await inscribirseAEntrenamientoService(idEntrenamiento, idUsuario);
    res.status(201).json({ message: "Inscripción realizada correctamente.", inscripcion: inscripcion });
};

export const eliminarInscripcion = async (req, res) => {
    const { id } = req.params;
    const idUsuario = req.decoded.id;
    const inscripcionEliminada = await eliminarInscripcionService(id, idUsuario);
    res.status(200).json({ message: "Inscripción eliminada correctamente.", data: inscripcionEliminada });
};

export const obtenerMisInscripciones = async (req, res) => {
    const idUsuario = req.decoded.id;
    const { page, limit, tipo } = req.query;
    const resultado = await obtenerMisInscripcionesService(idUsuario, page, limit, tipo);
    res.status(200).json({message: "Inscripciones obtenidas correctamente.", resultado: resultado});
};

export const obtenerMisEstadisticasCliente = async (req, res) => {
    const resultado = await obtenerMisEstadisticasClienteService(req.decoded.id);
    res.status(200).json({message: "Estadísticas del cliente obtenidas correctamente.", ...resultado});
};
