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
        const errorIdInvalido = new Error("ID de entrenamiento invalido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idEntrenamiento };
        throw errorIdInvalido;
    }

    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario invalido.");
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

    if (inscripcionExistente && (!inscripcionExistente.estado || inscripcionExistente.estado === "activa")) {
        const errorYaInscripto = new Error("El cliente ya esta inscripto a este entrenamiento.");
        errorYaInscripto.status = 409;
        errorYaInscripto.details = { idEntrenamiento, idUsuario };
        throw errorYaInscripto;
    }

    const cupoMaximo = entrenamiento.cupoMaximo || 10;
    const cantidadInscriptos = entrenamiento.inscriptos?.length || 0;

    if (cantidadInscriptos >= cupoMaximo) {
        const errorSinCupos = new Error("No hay cupos disponibles para este entrenamiento.");
        errorSinCupos.status = 409;
        errorSinCupos.details = { idEntrenamiento, cupoMaximo, cantidadInscriptos };
        throw errorSinCupos;
    }

    if (inscripcionExistente && inscripcionExistente.estado === "cancelada") {
        inscripcionExistente.estado = "activa";
        inscripcionExistente.fechaInscripcion = new Date();
        await inscripcionExistente.save();
        await Entrenamiento.findByIdAndUpdate(idEntrenamiento, { $addToSet: { inscriptos: idUsuario } });

        const inscripcionReactivada = await Inscripcion.findById(inscripcionExistente._id).populate("usuario", "nombre email rol").populate({ path: "entrenamiento", populate: [{ path: "categoria" }, { path: "creadoPor", select: "nombre email rol plan" }] });

        return inscripcionReactivada;
    }

    const nuevaInscripcion = new Inscripcion({ usuario: idUsuario, entrenamiento: idEntrenamiento });

    await nuevaInscripcion.save();

    await Usuario.findByIdAndUpdate(idUsuario, {$push: { inscripciones: nuevaInscripcion._id }});
    await Entrenamiento.findByIdAndUpdate(idEntrenamiento, { $addToSet: { inscriptos: idUsuario } });

    const inscripcionCreada = await Inscripcion.findById(nuevaInscripcion._id).populate("usuario", "nombre email rol").populate({ path: "entrenamiento", populate: [{ path: "categoria" }, { path: "creadoPor", select: "nombre email rol plan" }] });

    return inscripcionCreada;
};


export const eliminarInscripcionService = async (idEntrenamiento, idUsuario) => {
    if (!isValidObjectId(idEntrenamiento)) {
        const errorIdInvalido = new Error("ID de entrenamiento invalido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { idEntrenamiento };
        throw errorIdInvalido;
    }

    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario invalido.");
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
        const errorRolInvalido = new Error("Solo los clientes pueden eliminar su inscripcion.");
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

    const inscripcion = await Inscripcion.findOne({usuario: idUsuario,entrenamiento: idEntrenamiento, estado: { $ne: "cancelada" }});
    if (!inscripcion) {
        const errorInscripcionNoEncontrada = new Error("El cliente no esta inscripto a este entrenamiento.");
        errorInscripcionNoEncontrada.status = 404;
        errorInscripcionNoEncontrada.details = { idEntrenamiento, idUsuario };
        throw errorInscripcionNoEncontrada;
    }

    inscripcion.estado = "cancelada";
    await inscripcion.save();
    await Entrenamiento.findByIdAndUpdate(idEntrenamiento, { $pull: { inscriptos: idUsuario } });

    const inscripcionCancelada = await Inscripcion.findById(inscripcion._id).populate("usuario", "nombre email rol").populate({ path: "entrenamiento", populate: [{ path: "categoria" }, { path: "creadoPor", select: "nombre email rol plan" }] });
    return inscripcionCancelada;
};

export const obtenerMisInscripcionesService = async (idUsuario, page, limit, tipo) => {
    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario invalido.");
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
    const inscripcionesTodas = await Inscripcion.find(filtros).populate({path: "entrenamiento",populate: [{ path: "categoria" },{ path: "creadoPor", select: "nombre email rol plan" }]});
    const hoy = new Date();
    let inscripcionesFiltradas = inscripcionesTodas;

    if (tipo === "activas") {
        inscripcionesFiltradas = inscripcionesTodas.filter((inscripcion) => inscripcion.estado === "activa" && new Date(inscripcion.entrenamiento?.fecha) >= hoy);
    }

    if (tipo === "historial") {
        inscripcionesFiltradas = inscripcionesTodas.filter((inscripcion) => inscripcion.estado === "cancelada" || new Date(inscripcion.entrenamiento?.fecha) < hoy);
    }

    const skip = (page - 1) * limit;
    const cantidadInscripciones = inscripcionesFiltradas.length;
    const totalPages = Math.ceil(cantidadInscripciones / limit);
    if (totalPages > 0 && page > totalPages) page = totalPages;
    const skipFinal = (page - 1) * limit;
    const inscripciones = inscripcionesFiltradas.slice(skipFinal, skipFinal + limit);
    return {inscripciones,page,limit,totalPages,cantidadInscripciones};
};

export const obtenerMisEstadisticasClienteService = async (idUsuario) => {
    if (!isValidObjectId(idUsuario)) {
        const errorIdUsuarioInvalido = new Error("ID de usuario invalido.");
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
        const errorRolInvalido = new Error("Solo los clientes pueden ver sus estadísticas.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const hoy = new Date();
    const cantidadEntrenamientosDisponibles = await Entrenamiento.countDocuments({ fecha: { $gte: hoy } });
    const inscripcionesTodas = await Inscripcion.find({ usuario: idUsuario }).populate({path: "entrenamiento",populate: [{ path: "categoria" },{ path: "creadoPor", select: "nombre email rol plan" }]});

    const inscripcionesActivas = inscripcionesTodas.filter((inscripcion) => inscripcion.estado === "activa" && new Date(inscripcion.entrenamiento?.fecha) >= hoy);
    const entrenamientosRealizados = inscripcionesTodas.filter((inscripcion) => inscripcion.estado === "activa" && new Date(inscripcion.entrenamiento?.fecha) < hoy);
    const inscripcionesParaGrafica = [...inscripcionesActivas, ...entrenamientosRealizados];

    const proximoEntrenamiento = [...inscripcionesActivas].sort((a, b) => new Date(a.entrenamiento?.fecha) - new Date(b.entrenamiento?.fecha))[0] || null;

    const categoriasContadas = {};
    inscripcionesParaGrafica.forEach((inscripcion) => {
        const nombreCategoria = inscripcion.entrenamiento?.categoria?.nombre || "Sin categoría";
        categoriasContadas[nombreCategoria] = (categoriasContadas[nombreCategoria] || 0) + 1;
    });

    const categoriasGrafica = Object.entries(categoriasContadas)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 3);

    return {
        cantidadEntrenamientosDisponibles,
        cantidadInscripcionesActivas: inscripcionesActivas.length,
        cantidadEntrenamientosRealizados: entrenamientosRealizados.length,
        proximoEntrenamiento,
        categoriasGrafica
    };
};
