import { isValidObjectId } from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../model/usuario.model.js"

export const obtenerPerfilUsuarioService = async (idUsuarioLogueado) => {
    if (!isValidObjectId(idUsuarioLogueado)) {
        const errorIdInvalido = new Error("ID de usuario invÃ¡lido.");
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
    const usuarioObjeto = usuarioBuscado.toObject();
    delete usuarioObjeto.password;

    const entrenamientosCreados = usuarioObjeto.entrenamientosCreados?.length || 0;
    const limitePlan = usuarioObjeto.plan === "plus" ? 4 : null;
    const porcentajeUso = limitePlan ? Math.min((entrenamientosCreados * 100) / limitePlan, 100) : 100;
    const entrenamientosRestantes = limitePlan ? Math.max(limitePlan - entrenamientosCreados, 0) : "Sin límite";

    usuarioObjeto.usoPlan = {
        entrenamientosCreados,
        limitePlan,
        porcentajeUso,
        entrenamientosRestantes
    };

    if (usuarioObjeto.rol === "cliente") {
        const hoy = new Date();
        const inscripciones = usuarioObjeto.inscripciones || [];
        const inscripcionesActivas = inscripciones.filter((inscripcion) => (
            inscripcion.estado === "activa" && new Date(inscripcion.entrenamiento?.fecha) >= hoy
        ));
        const entrenamientosRealizados = inscripciones.filter((inscripcion) => (
            inscripcion.estado === "activa" && new Date(inscripcion.entrenamiento?.fecha) < hoy
        ));
        const inscripcionesCanceladas = inscripciones.filter((inscripcion) => inscripcion.estado === "cancelada");
        const proximoEntrenamiento = [...inscripcionesActivas].sort((a, b) => (
            new Date(a.entrenamiento?.fecha) - new Date(b.entrenamiento?.fecha)
        ))[0] || null;
        const ultimoEntrenamiento = [...entrenamientosRealizados].sort((a, b) => (
            new Date(b.entrenamiento?.fecha) - new Date(a.entrenamiento?.fecha)
        ))[0] || null;

        usuarioObjeto.actividadCliente = {
            cantidadInscripcionesActivas: inscripcionesActivas.length,
            cantidadEntrenamientosRealizados: entrenamientosRealizados.length,
            cantidadInscripcionesCanceladas: inscripcionesCanceladas.length,
            proximoEntrenamiento,
            ultimoEntrenamiento
        };
    }

    return usuarioObjeto;
};

export const cambiarPlanUsuarioService = async (id, planActualizar, idUsuarioLogueado) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de usuario invÃ¡lido.");
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
        const errorNuevoPlanInvalido = new Error("El Ãºnico cambio permitido es de plus a premium.");
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

export const actualizarFotoPerfilUsuarioService = async (fotoActualizar, idUsuarioLogueado) => {
    if (!isValidObjectId(idUsuarioLogueado)) {
        const errorIdInvalido = new Error("ID de usuario invalido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idUsuarioLogueado };
        throw errorIdInvalido;
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuarioLogueado, fotoActualizar, { returnDocument: "after" });

    if (!usuarioActualizado) {
        const errorUsuarioNoEncontrado = new Error("Usuario no encontrado.");
        errorUsuarioNoEncontrado.status = 404;
        errorUsuarioNoEncontrado.details = { idUsuarioLogueado };
        throw errorUsuarioNoEncontrado;
    }

    return usuarioActualizado;
};

export const cambiarPasswordUsuarioService = async (passwordActualizar, idUsuarioLogueado) => {
    if (!isValidObjectId(idUsuarioLogueado)) {
        const errorIdInvalido = new Error("ID de usuario invalido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idUsuarioLogueado };
        throw errorIdInvalido;
    }

    const usuarioExistente = await Usuario.findById(idUsuarioLogueado);

    if (!usuarioExistente) {
        const errorUsuarioNoEncontrado = new Error("Usuario no encontrado.");
        errorUsuarioNoEncontrado.status = 404;
        errorUsuarioNoEncontrado.details = { idUsuarioLogueado };
        throw errorUsuarioNoEncontrado;
    }

    const passwordCorrecta = bcrypt.compareSync(passwordActualizar.passwordActual, usuarioExistente.password);

    if (!passwordCorrecta) {
        const errorPasswordInvalida = new Error("La contraseña actual es incorrecta.");
        errorPasswordInvalida.status = 401;
        throw errorPasswordInvalida;
    }

    const mismaPassword = bcrypt.compareSync(passwordActualizar.passwordNueva, usuarioExistente.password);

    if (mismaPassword) {
        const errorMismaPassword = new Error("La nueva contraseña debe ser distinta a la actual.");
        errorMismaPassword.status = 409;
        throw errorMismaPassword;
    }

    usuarioExistente.password = passwordActualizar.passwordNueva;
    await usuarioExistente.save();

    return {
        _id: usuarioExistente._id,
        nombre: usuarioExistente.nombre,
        email: usuarioExistente.email,
        rol: usuarioExistente.rol,
        plan: usuarioExistente.plan,
        fotoPerfil: usuarioExistente.fotoPerfil,
    };
};



//aca corregir porque no conviene devolver password
