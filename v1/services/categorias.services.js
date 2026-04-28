import { isValidObjectId } from "mongoose";
import Categoria from "../model/categoria.model.js"
import Entrenamiento from "../model/entrenamiento.model.js"
import Usuario from "../model/usuario.model.js"
import { useGemini25FlashService } from "./ai.services.js"

export const obtenerCategoriasService = async (page, limit, nombre) => {
    limit = Number(limit) || 3;
    page = Number(page) || 1;
    if (page < 1) page = 1;
    if (limit < 1) limit = 3;

    const filtros = {};
    if (nombre) {
        filtros.nombre = { $regex: nombre, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const cantidadCategorias = await Categoria.countDocuments(filtros);
    const totalPages = Math.ceil(cantidadCategorias / limit);
    const categorias = await Categoria.find(filtros).skip(skip).limit(limit);
    return { categorias, page, limit, totalPages, cantidadCategorias };
};

export const crearCategoriaService = async (categoriaGuardar, idUsuario) => {
    const usuarioLogueado = await Usuario.findById(idUsuario);

    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }

    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden crear categorías.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }

    const categoriaExistente = await Categoria.findOne({ nombre: categoriaGuardar.nombre });

    if (categoriaExistente) {
        const errorCategoriaExistente = new Error("Ya existe categoría con ese nombre.");
        errorCategoriaExistente.status = 409;
        errorCategoriaExistente.details = { nombre: categoriaGuardar.nombre };
        throw errorCategoriaExistente;
    }

    if (categoriaGuardar.descripcion) {
        const prompt = `Generá una descripción breve, clara y profesional para una categoría de entrenamientos de gimnasio llamada "${categoriaGuardar.nombre}".
                        IMPORTANTE:
                        - Respondé SOLO con la descripción final.
                        - No agregues introducciones.
                        - No digas "opción", "te dejo", ni nada similar.
                        - No uses listas ni markdown.
                        - No expliques nada.
                        - Máximo 200 caracteres.
                        Pedido del usuario: ${categoriaGuardar.descripcion}`;

        const descripcionGenerada = await useGemini25FlashService(prompt);
        if (descripcionGenerada) {
            categoriaGuardar.descripcion = descripcionGenerada.trim();
        } else {
            categoriaGuardar.descripcion = `Categoría de entrenamientos enfocada en ${categoriaGuardar.nombre}, pensada para mejorar el rendimiento físico de forma progresiva.`;
        }
    }

    const categoria = new Categoria(categoriaGuardar);
    await categoria.save();

    return categoria;
};

export const obtenerCategoriaPorIdService = async (id) => {
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de categoría inválida.")
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }
    const categoriaBuscada = await Categoria.findById(id);
    if (!categoriaBuscada) {
        const errorCategoriaNoEncontrada = new Error("Categoría no encontrada.");
        errorCategoriaNoEncontrada.status = 404;
        errorCategoriaNoEncontrada.details = { id };
        throw errorCategoriaNoEncontrada;
    }
    return categoriaBuscada;
}

export const actualizarCategoriaService = async (id, categoriaActualizar, idUsuario) => {
    const usuarioLogueado = await Usuario.findById(idUsuario);
    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }
    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden modificar categorías.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de categoría inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const categoriaExistente = await Categoria.findById(id);
    if (!categoriaExistente) {
        const errorCategoriaInexistente = new Error(`No existe categoría con ID ${id}.`);
        errorCategoriaInexistente.status = 404;
        errorCategoriaInexistente.details = { id };
        throw errorCategoriaInexistente;
    }

    if (categoriaActualizar.nombre) {
        const categoriaMismoNombre = await Categoria.findOne({ nombre: categoriaActualizar.nombre });
        if (categoriaMismoNombre && categoriaMismoNombre._id.toString() !== id) {
            const errorCategoriaExistente = new Error("Ya existe categoría con ese nombre.");
            errorCategoriaExistente.status = 409;
            errorCategoriaExistente.details = { nombre: categoriaActualizar.nombre };
            throw errorCategoriaExistente;
        }
    }

    const categoriaActualizada = await Categoria.findByIdAndUpdate(id, categoriaActualizar, { returnDocument: "after" });
    return categoriaActualizada;
};

export const eliminarCategoriaService = async (id, idUsuario) => {
    const usuarioLogueado = await Usuario.findById(idUsuario);
    if (!usuarioLogueado) {
        const errorUsuarioInexistente = new Error("Usuario autenticado no encontrado.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { idUsuario };
        throw errorUsuarioInexistente;
    }
    if (usuarioLogueado.rol !== "entrenador") {
        const errorRolInvalido = new Error("Solo los entrenadores pueden eliminar categorías.");
        errorRolInvalido.status = 403;
        throw errorRolInvalido;
    }
    if (!isValidObjectId(id)) {
        const errorIdInvalido = new Error("ID de categoría inválido.");
        errorIdInvalido.status = 400;
        errorIdInvalido.details = { id };
        throw errorIdInvalido;
    }

    const categoriaBuscada = await Categoria.findById(id);
    if (!categoriaBuscada) {
        const errorCategoriaInexistente = new Error(`No existe categoría con ID ${id}.`);
        errorCategoriaInexistente.status = 404;
        errorCategoriaInexistente.details = { id };
        throw errorCategoriaInexistente;
    }

    const entrenamientoAsociado = await Entrenamiento.findOne({ categoria: id });
    if (entrenamientoAsociado) {
        const errorCategoriaConEntrenamientos = new Error("No se puede eliminar la categoría porque tiene entrenamientos asociados.");
        errorCategoriaConEntrenamientos.status = 409;
        errorCategoriaConEntrenamientos.details = { id };
        throw errorCategoriaConEntrenamientos;
    }

    const categoriaEliminada = await Categoria.findByIdAndDelete(id);
    return categoriaEliminada;
};