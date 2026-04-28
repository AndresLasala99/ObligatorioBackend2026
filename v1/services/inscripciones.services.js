import { isValidObjectId } from "mongoose";
import Usuario from "../model/usuario.model.js";
import Entrenamiento from "../model/entrenamiento.model.js";
import Inscripcion from "../model/inscripcion.model.js";

export const inscribirseAEntrenamientoService = async (idEntrenamiento, idUsuario) => {
    if (!idEntrenamiento) {
        const error = new Error("El ID del entrenamiento es obligatorio.");
        error.status = 400;
        throw error;
    }

    if (!isValidObjectId(idEntrenamiento)) {
        const errorIdInvalido = new Error("ID de entrenamiento inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idEntrenamiento };
        throw errorIdInvalido;
    }

    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario inválido.");
        errorIdUsuarioInvalido.status = 400;
        errorIdUsuarioInvalido.details = { idUsuario };
        throw errorIdUsuarioInvalido;
    }

    const usuarioLogueado = await Usuario.findById(idUsuario);

    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        throw errorUsuarioInexistente;
    }

    if (usuarioLogueado.rol !== "cliente") {
        const errorRolInvalido = new Error("Solo los clientes pueden inscribirse a entrenamientos.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const entrenamiento = await Entrenamiento.findById(idEntrenamiento);

    if (!entrenamiento) {
        const errorEntrenamientoNoEncontrado = new Error("Entrenamiento no encontrado.");
        errorEntrenamientoNoEncontrado.status = 404;
        errorEntrenamientoNoEncontrado.details = { idEntrenamiento };
        throw errorEntrenamientoNoEncontrado;
    }

    const inscripcionExistente = await Inscripcion.findOne({ usuario: idUsuario, entrenamiento: idEntrenamiento });

    if (inscripcionExistente) {
        const errorYaInscripto = new Error("El cliente ya está inscripto a este entrenamiento.");
        errorYaInscripto.status = 409;
        errorYaInscripto.details = { idEntrenamiento, idUsuario };
        throw errorYaInscripto;
    }

    const nuevaInscripcion = new Inscripcion({ usuario: idUsuario, entrenamiento: idEntrenamiento });

    await nuevaInscripcion.save();

    await Usuario.findByIdAndUpdate(idUsuario, {$push: { inscripciones: nuevaInscripcion._id }});

    const inscripcionCreada = await Inscripcion.findById(nuevaInscripcion._id).populate("usuario", "nombre email rol").populate({ path: "entrenamiento", populate: [{ path: "categoria" }, { path: "creadoPor", select: "nombre email rol plan" }] });

    return inscripcionCreada;
};


export const eliminarInscripcionService = async (idEntrenamiento, idUsuario) => {
    if (!isValidObjectId(idEntrenamiento)) {
        const errorIdInvalido = new Error("ID de entrenamiento inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idEntrenamiento };
        throw errorIdInvalido;
    }

    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario inválido.");
        errorIdUsuarioInvalido.status = 400;
        errorIdUsuarioInvalido.details = { idUsuario };
        throw errorIdUsuarioInvalido;
    }

    const usuarioLogueado = await Usuario.findById(idUsuario);
    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }

    if (usuarioLogueado.rol !== "cliente") {
        const errorRolInvalido = new Error("Solo los clientes pueden eliminar su inscripción.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const entrenamiento = await Entrenamiento.findById(idEntrenamiento);
    if (!entrenamiento) {
        const errorEntrenamientoNoEncontrado = new Error("Entrenamiento no encontrado.");
        errorEntrenamientoNoEncontrado.status = 404;
        errorEntrenamientoNoEncontrado.details = { idEntrenamiento };
        throw errorEntrenamientoNoEncontrado;
    }

    const inscripcionEliminada = await Inscripcion.findOneAndDelete({usuario: idUsuario,entrenamiento: idEntrenamiento});
    if (!inscripcionEliminada) {
        const errorInscripcionNoEncontrada = new Error("El cliente no está inscripto a este entrenamiento.");
        errorInscripcionNoEncontrada.status = 404;
        errorInscripcionNoEncontrada.details = { idEntrenamiento, idUsuario };
        throw errorInscripcionNoEncontrada;
    }

    await Usuario.findByIdAndUpdate(idUsuario, {$pull: { inscripciones: inscripcionEliminada._id }});
    return inscripcionEliminada;
};

export const obtenerMisInscripcionesService = async (idUsuario, page, limit) => {
    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario inválido.");
        errorIdUsuarioInvalido.status = 400;
        errorIdUsuarioInvalido.details = { idUsuario };
        throw errorIdUsuarioInvalido;
    }

    const usuarioLogueado = await Usuario.findById(idUsuario);
    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }
    if (usuarioLogueado.rol !== "cliente") {
        const errorRolInvalido = new Error("Solo los clientes pueden ver sus inscripciones.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    limit = Number(limit) || 3;
    page = Number(page) || 1;
    if (page < 1) page = 1;
    if (limit < 1) limit = 3;

    const filtros = { usuario: idUsuario };
    const skip = (page - 1) * limit;
    const cantidadInscripciones = await Inscripcion.countDocuments(filtros);
    const totalPages = Math.ceil(cantidadInscripciones / limit);
    const inscripciones = await Inscripcion.find(filtros).skip(skip).limit(limit).populate({path: "entrenamiento",populate: [{ path: "categoria" },{ path: "creadoPor", select: "nombre email rol plan" }]});
    return {inscripciones,page,limit,totalPages,cantidadInscripciones};
};