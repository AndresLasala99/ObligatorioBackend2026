import { isValidObjectId } from "mongoose";
import Usuario from "../model/usuario.model.js"

export const obtenerPerfilUsuarioService = async (idUsuarioLogueado) => {
    if (!isValidObjectId(idUsuarioLogueado)) {
        const errorIdInvalido = new Error("ID de usuario inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idUsuarioLogueado };
        throw errorIdInvalido;
    }

    const usuarioBuscado = await Usuario.findById(idUsuarioLogueado).populate("entrenamientosCreados").populate({path: "inscripciones",populate: {path: "entrenamiento",populate: "categoria creadoPor"}});

    if (!usuarioBuscado) {
        const errorUsuarioNoEncontrado = new Error("Usuario no encontrado.");
        errorUsuarioNoEncontrado.status = 404;
        errorUsuarioNoEncontrado.details = { idUsuarioLogueado };
        throw errorUsuarioNoEncontrado;
    }
    return usuarioBuscado;
};

export const cambiarPlanUsuarioService = async (id, planActualizar, idUsuarioLogueado) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de usuario inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) {
        const errorUsuarioInexistente = new Error(`No existe usuario con ID ${id}.`);
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { id };
        throw errorUsuarioInexistente;
    }

    if (id !== idUsuarioLogueado) {
        const errorNoAutorizado = new Error("No tienes permiso para modificar este usuario.");
        errorNoAutorizado.status = 403;
        errorNoAutorizado.details = { id, idUsuarioLogueado };
        throw errorNoAutorizado;
    }

    if (usuarioExistente.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden cambiar de plan.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    if (planActualizar.plan !== "premium") {
        const errorNuevoPlanInvalido = new Error("El único cambio permitido es de plus a premium.");
        errorNuevoPlanInvalido.status = 400;
        throw errorNuevoPlanInvalido;
    }

    if (usuarioExistente.plan === "premium") {
        const errorPlanPremium = new Error("El usuario ya tiene plan premium.");
        errorPlanPremium.status = 409;
        throw errorPlanPremium;
    }

    if (usuarioExistente.plan !== "plus") {
        const errorPlanInvalido = new Error("Solo se puede cambiar a premium desde el plan plus.");
        errorPlanInvalido.status = 409;
        throw errorPlanInvalido;
    }

    usuarioExistente.plan = "premium";
    await usuarioExistente.save();
    return usuarioExistente;
};



//aca corregir porque no conviene devolver password