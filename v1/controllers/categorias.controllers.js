import { actualizarCategoriaService, crearCategoriaService, eliminarCategoriaService, obtenerCategoriasService, obtenerCategoriaPorIdService } from "../services/categorias.services.js";

export const obtenerCategorias = async (req, res) => {
    const { page, limit, nombre } = req.query;
    const resultado = await obtenerCategoriasService(page, limit, nombre);
    res.status(200).json({ message: "Categorías obtenidas correctamente.", resultado: resultado });
};

export const crearCategoria = async (req, res) => {
    const categoriaCreada = await crearCategoriaService(req.body, req.decoded.id);
    res.status(201).json({ message: "Categoría creada correctamente.", categoria: categoriaCreada });
}

export const obtenerCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    const categoriaBuscada = await obtenerCategoriaPorIdService(id);
    res.json({ message: `Obtener categoria con ID: ${id}.`, categoriaBuscada });
}

export const actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const categoriaActualizada = await actualizarCategoriaService(id, req.body, req.decoded.id);
    res.json({ message: `Categoría con ID ${id} actualizada.`, categoriaActualizada });
};

export const eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    await eliminarCategoriaService(id, req.decoded.id);
    res.json({ message: "Categoría eliminada correctamente." });
};