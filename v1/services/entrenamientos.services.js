import { isValidObjectId } from "mongoose";
import Entrenamiento from "../model/entrenamiento.model.js"
import Categoria from "../model/categoria.model.js"
import Usuario from "../model/usuario.model.js"
import Inscripcion from "../model/inscripcion.model.js"

export const obtenerEntrenamientosService = async (page, limit, nivel, categoria, titulo, disponibles, entrenador) => {
    limit = Number(limit) || 3;
    page = Number(page) || 1;
    if (page < 1) page = 1;
    if (limit < 1) limit = 3;

    const filtros = {};
    if (nivel) {
        filtros.nivel = nivel;
    }
    if (categoria) {
        if (!isValidObjectId(categoria)) {
            const errorCategoriaInvalida = new Error("ID de categorÃ­a invÃ¡lido.");
            errorCategoriaInvalida.status = 400;
            errorCategoriaInvalida.details = { categoria };
            throw errorCategoriaInvalida;
        }
        filtros.categoria = categoria;
    }
    if (titulo) {
        filtros.titulo = { $regex: titulo, $options: "i" };
    }
    if (entrenador) {
        const entrenadores = await Usuario.find({ nombre: { $regex: entrenador, $options: "i" }, rol: "entrenador" });
        const idsEntrenadores = entrenadores.map((entrenadorEncontrado) => entrenadorEncontrado._id);
        filtros.creadoPor = { $in: idsEntrenadores };
    }
    if (disponibles === "true") {
        filtros.fecha = { $gte: new Date() };
    }

    const cantidadEntrenamientos = await Entrenamiento.countDocuments(filtros);
    const totalPages = Math.ceil(cantidadEntrenamientos / limit);
    if (totalPages > 0 && page > totalPages) page = totalPages;
    const skipFinal = (page - 1) * limit;
    const entrenamientos = await Entrenamiento.find(filtros).sort({ fecha: 1 }).skip(skipFinal).limit(limit).populate("categoria").populate("creadoPor", "nombre email rol plan").populate("inscriptos", "nombre email fotoPerfil");
    return { entrenamientos, page, limit, totalPages, cantidadEntrenamientos };
};

export const obtenerMisEntrenamientosService = async (idUsuario, page, limit, nivel, categoria, titulo, tipo) => {
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

    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden ver sus entrenamientos.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    limit = Number(limit) || 5;
    page = Number(page) || 1;
    if (page < 1) page = 1;
    if (limit < 1) limit = 5;

    const filtros = { creadoPor: idUsuario };
    if (nivel) {
        filtros.nivel = nivel;
    }
    if (categoria) {
        if (!isValidObjectId(categoria)) {
            const errorCategoriaInvalida = new Error("ID de categorÃ­a invÃ¡lido.");
            errorCategoriaInvalida.status = 400;
            errorCategoriaInvalida.details = { categoria };
            throw errorCategoriaInvalida;
        }
        filtros.categoria = categoria;
    }
    if (titulo) {
        filtros.titulo = { $regex: titulo, $options: "i" };
    }
    if (tipo === "proximos") {
        filtros.fecha = { $gte: new Date() };
    }
    if (tipo === "historial") {
        filtros.fecha = { $lt: new Date() };
    }

    const cantidadEntrenamientos = await Entrenamiento.countDocuments(filtros);
    const totalPages = Math.ceil(cantidadEntrenamientos / limit);
    if (totalPages > 0 && page > totalPages) page = totalPages;
    const skip = (page - 1) * limit;
    const ordenFecha = tipo === "proximos" ? 1 : -1;
    const entrenamientos = await Entrenamiento.find(filtros).sort({ fecha: ordenFecha }).skip(skip).limit(limit).populate("categoria").populate("creadoPor", "nombre email rol plan").populate("inscriptos", "nombre email fotoPerfil");

    return { entrenamientos, page, limit, totalPages, cantidadEntrenamientos };
};

export const obtenerMisEstadisticasService = async (idUsuario) => {
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

    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden ver sus estadísticas.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const entrenamientos = await Entrenamiento.find({ creadoPor: idUsuario }).populate("categoria").populate("creadoPor", "nombre email rol plan").populate("inscriptos", "nombre email fotoPerfil");
    const cantidadEntrenamientos = entrenamientos.length;
    const totalInscriptos = entrenamientos.reduce((total, entrenamiento) => total + (entrenamiento.inscriptos?.length || 0), 0);
    const promedioAlumnos = cantidadEntrenamientos > 0 ? Number((totalInscriptos / cantidadEntrenamientos).toFixed(1)) : 0;

    const entrenamientoMasInscriptos = entrenamientos.length > 0 ? [...entrenamientos].sort((a, b) => (b.inscriptos?.length || 0) - (a.inscriptos?.length || 0))[0] : null;
    const entrenamientosPorNivel = ["principiante", "intermedio", "avanzado"].map((nivel) => ({
        nivel,
        cantidad: entrenamientos.filter((entrenamiento) => entrenamiento.nivel === nivel).length
    }));
    const inscriptosPorEntrenamiento = entrenamientos.map((entrenamiento) => ({
        titulo: entrenamiento.titulo,
        cantidad: entrenamiento.inscriptos?.length || 0
    })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    const alumnosConstantes = {};
    entrenamientos.forEach((entrenamiento) => {
        entrenamiento.inscriptos?.forEach((alumno) => {
            if (!alumnosConstantes[alumno._id]) {
                alumnosConstantes[alumno._id] = {
                    nombre: alumno.nombre,
                    email: alumno.email,
                    fotoPerfil: alumno.fotoPerfil,
                    cantidad: 0,
                    ultimaFecha: null,
                };
            }
            alumnosConstantes[alumno._id].cantidad += 1;
            if (!alumnosConstantes[alumno._id].ultimaFecha || new Date(entrenamiento.fecha) > new Date(alumnosConstantes[alumno._id].ultimaFecha)) {
                alumnosConstantes[alumno._id].ultimaFecha = entrenamiento.fecha;
            }
        });
    });

    const hoy = new Date();
    const alumnosInactivos = {};
    entrenamientos.forEach((entrenamiento) => {
        if (new Date(entrenamiento.fecha) > hoy) return;

        entrenamiento.inscriptos?.forEach((alumno) => {
            if (!alumnosInactivos[alumno._id]) {
                alumnosInactivos[alumno._id] = {
                    nombre: alumno.nombre,
                    email: alumno.email,
                    fotoPerfil: alumno.fotoPerfil,
                    ultimaFecha: null,
                };
            }
            if (!alumnosInactivos[alumno._id].ultimaFecha || new Date(entrenamiento.fecha) > new Date(alumnosInactivos[alumno._id].ultimaFecha)) {
                alumnosInactivos[alumno._id].ultimaFecha = entrenamiento.fecha;
            }
        });
    });

    const alumnoMasConstante = Object.values(alumnosConstantes).sort((a, b) => b.cantidad - a.cantidad)[0] || null;
    const alumnoMasInactivo = Object.values(alumnosInactivos).sort((a, b) => new Date(a.ultimaFecha) - new Date(b.ultimaFecha))[0] || null;

    return {
        cantidadEntrenamientos,
        entrenamientoMasInscriptos,
        promedioAlumnos,
        alumnoMasConstante,
        alumnoMasInactivo,
        entrenamientosPorNivel,
        inscriptosPorEntrenamiento,
    };
};

export const crearEntrenamientoService = async (entrenamientoGuardar, idUsuario) => {
    const usuarioLogueado = await Usuario.findById(idUsuario);
    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }
    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden crear entrenamientos.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const cantidadEntrenamientos = await Entrenamiento.countDocuments({ creadoPor: idUsuario });
    if (usuarioLogueado.plan === "plus" && cantidadEntrenamientos >= 4) {
        const errorLimitePlan = new Error("No puedes crear mÃ¡s de 4 entrenamientos con el plan plus.");
        errorLimitePlan.status = 403;
        errorLimitePlan.details = { idUsuario, cantidadEntrenamientos };
        throw errorLimitePlan;
    }

    const entrenamientoExistente = await Entrenamiento.findOne({ titulo: entrenamientoGuardar.titulo });
    if (entrenamientoExistente) {
        const errorEntrenamientoExistente = new Error("Ya existe entrenamiento con ese tÃ­tulo.");
        errorEntrenamientoExistente.status = 409;
        errorEntrenamientoExistente.details = { titulo: entrenamientoGuardar.titulo };
        throw errorEntrenamientoExistente;
    }

    if (!isValidObjectId(entrenamientoGuardar.categoria)) {
        const errorCategoriaInvalida = new Error("ID de categorÃ­a invÃ¡lido.");
        errorCategoriaInvalida.status = 400;
        errorCategoriaInvalida.details = { categoria: entrenamientoGuardar.categoria };
        throw errorCategoriaInvalida;
    }

    const categoriaExistente = await Categoria.findById(entrenamientoGuardar.categoria);
    if (!categoriaExistente) {
        const errorCategoriaInexistente = new Error("La categorÃ­a no existe.");
        errorCategoriaInexistente.status = 404;
        errorCategoriaInexistente.details = { categoria: entrenamientoGuardar.categoria };
        throw errorCategoriaInexistente;
    }

    const fechaParseada = new Date(entrenamientoGuardar.fecha);
    if (fechaParseada < new Date()) {
        const errorFechaPasada = new Error("La fecha del entrenamiento no puede ser anterior a la fecha actual.");
        errorFechaPasada.status = 400;
        errorFechaPasada.details = { fecha: entrenamientoGuardar.fecha };
        throw errorFechaPasada;
    }
    entrenamientoGuardar.fecha = fechaParseada;

    const entrenamiento = new Entrenamiento({ ...entrenamientoGuardar, creadoPor: idUsuario });
    await entrenamiento.save();

    await Usuario.findByIdAndUpdate(idUsuario, { $push: { entrenamientosCreados: entrenamiento._id } });
    await Categoria.findByIdAndUpdate(entrenamientoGuardar.categoria, { $push: { entrenamientos: entrenamiento._id } });

    const entrenamientoCreado = await Entrenamiento.findById(entrenamiento._id).populate("categoria").populate("creadoPor").populate("inscriptos", "nombre email fotoPerfil");
    return entrenamientoCreado;
};

export const obtenerEntrenamientoPorIdService = async (id) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de entrenamiento invÃ¡lido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const entrenamientoBuscado = await Entrenamiento.findById(id).populate("categoria").populate("creadoPor", "nombre email rol plan").populate("inscriptos", "nombre email fotoPerfil");
    if (!entrenamientoBuscado) {
        const errorEntrenamientoNoEncontrado = new Error("Entrenamiento no encontrado.");
        errorEntrenamientoNoEncontrado.status = 404;
        errorEntrenamientoNoEncontrado.details = { id };
        throw errorEntrenamientoNoEncontrado;
    }
    return entrenamientoBuscado;
};

export const actualizarEntrenamientoService = async (id, entrenamientoActualizar, idUsuario) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de entrenamiento invÃ¡lido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const entrenamientoExistente = await Entrenamiento.findById(id);
    if (!entrenamientoExistente) {
        const errorEntrenamientoInexistente = new Error(`No existe entrenamiento con ID ${id}.`);
        errorEntrenamientoInexistente.status = 404;
        errorEntrenamientoInexistente.details = { id };
        throw errorEntrenamientoInexistente;
    }

    if (entrenamientoExistente.creadoPor.toString() !== idUsuario) {
        const errorNoAutorizado = new Error("Solo su creador puede modificar este entrenamiento.");
        errorNoAutorizado.status = 403;
        errorNoAutorizado.details = { id, idUsuario };
        throw errorNoAutorizado;
    }

    if (entrenamientoActualizar.titulo) {
        const entrenamientoMismoTitulo = await Entrenamiento.findOne({ titulo: entrenamientoActualizar.titulo });
        if (entrenamientoMismoTitulo && entrenamientoMismoTitulo._id.toString() !== id) {
            const errorEntrenamientoExistente = new Error("Ya existe entrenamiento con ese tÃ­tulo.");
            errorEntrenamientoExistente.status = 409;
            errorEntrenamientoExistente.details = { titulo: entrenamientoActualizar.titulo };
            throw errorEntrenamientoExistente;
        }
    }

    if (entrenamientoActualizar.categoria) {
        if (!isValidObjectId(entrenamientoActualizar.categoria)) {
            const errorCategoriaInvalida = new Error("ID de categorÃ­a invÃ¡lido.");
            errorCategoriaInvalida.status = 400;
            errorCategoriaInvalida.details = { categoria: entrenamientoActualizar.categoria };
            throw errorCategoriaInvalida;
        }

        const categoriaExistente = await Categoria.findById(entrenamientoActualizar.categoria);
        if (!categoriaExistente) {
            const errorCategoriaNoEncontrada = new Error("La categorÃ­a no existe.");
            errorCategoriaNoEncontrada.status = 404;
            errorCategoriaNoEncontrada.details = { categoria: entrenamientoActualizar.categoria };
            throw errorCategoriaNoEncontrada;
        }

        if (entrenamientoActualizar.categoria !== entrenamientoExistente.categoria.toString()) {
            await Categoria.findByIdAndUpdate(entrenamientoExistente.categoria, { $pull: { entrenamientos: entrenamientoExistente._id } });
            await Categoria.findByIdAndUpdate(entrenamientoActualizar.categoria, { $push: { entrenamientos: entrenamientoExistente._id } });
        }
    }

    if (entrenamientoActualizar.fecha) {
        const fechaParseada = new Date(entrenamientoActualizar.fecha);
        if (fechaParseada < new Date()) {
            const errorFechaPasada = new Error("La fecha del entrenamiento no puede ser anterior a la fecha actual.");
            errorFechaPasada.status = 400;
            errorFechaPasada.details = { fecha: entrenamientoActualizar.fecha };
            throw errorFechaPasada;
        }
        entrenamientoActualizar.fecha = fechaParseada;
    }

    if (entrenamientoActualizar.cupoMaximo) {
        const cantidadInscriptos = entrenamientoExistente.inscriptos?.length || 0;
        if (entrenamientoActualizar.cupoMaximo < cantidadInscriptos) {
            const errorCupoMenor = new Error("El cupo no puede ser menor a la cantidad de alumnos inscriptos.");
            errorCupoMenor.status = 400;
            errorCupoMenor.details = { cupoMaximo: entrenamientoActualizar.cupoMaximo, cantidadInscriptos };
            throw errorCupoMenor;
        }
    }

    const entrenamientoActualizado = await Entrenamiento.findByIdAndUpdate(id, entrenamientoActualizar, { returnDocument: "after" }).populate("categoria").populate("creadoPor", "nombre email rol plan").populate("inscriptos", "nombre email fotoPerfil");
    return entrenamientoActualizado;
};

export const eliminarEntrenamientoService = async (id, idUsuario) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de entrenamiento invÃ¡lido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const entrenamientoExistente = await Entrenamiento.findById(id);

    if (!entrenamientoExistente) {
        const errorEntrenamientoInexistente = new Error(`No existe entrenamiento con ID ${id}.`);
        errorEntrenamientoInexistente.status = 404;
        errorEntrenamientoInexistente.details = { id };
        throw errorEntrenamientoInexistente;
    }

    if (entrenamientoExistente.creadoPor.toString() !== idUsuario) {
        const errorNoAutorizado = new Error("Solo el creador de este entrenamiento puede eliminarlo.");
        errorNoAutorizado.status = 403;
        errorNoAutorizado.details = { id, idUsuario };
        throw errorNoAutorizado;
    }

    const inscripcionesDelEntrenamiento = await Inscripcion.find({entrenamiento: id});
    const idsInscripciones = inscripcionesDelEntrenamiento.map(i => i._id);

    await Usuario.updateMany({ inscripciones: { $in: idsInscripciones } },{ $pull: { inscripciones: { $in: idsInscripciones } } });
    await Inscripcion.deleteMany({ entrenamiento: id });

    const entrenamientoEliminado = await Entrenamiento.findByIdAndDelete(id);
    if (!entrenamientoEliminado) {
        const error = new Error("No se pudo eliminar el entrenamiento.");
        error.status = 500;
        throw error;
    }

    await Usuario.findByIdAndUpdate(entrenamientoEliminado.creadoPor, { $pull: { entrenamientosCreados: entrenamientoEliminado._id } });
    await Categoria.findByIdAndUpdate(entrenamientoEliminado.categoria, { $pull: { entrenamientos: entrenamientoEliminado._id } });
    return entrenamientoEliminado;
};

