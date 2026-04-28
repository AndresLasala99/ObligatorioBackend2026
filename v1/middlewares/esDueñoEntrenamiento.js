import { isValidObjectId } from "mongoose";
import Entrenamiento from "../model/entrenamiento.model.js";

const esDueñoEntrenamiento = async (req, res, next) => {
    const { id } = req.params;
    const idUsuario = req.decoded.id;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de entrenamiento inválido." });
    }

    const entrenamiento = await Entrenamiento.findById(id);
    if (!entrenamiento) {
        return res.status(404).json({ message: "Entrenamiento no encontrado." });
    }
    if (entrenamiento.creadoPor.toString() !== idUsuario) {
        return res.status(403).json({ message: "Solo el creador de este entrenamiento puede realizar esta acción." });
    }
    next();
};

export default esDueñoEntrenamiento;