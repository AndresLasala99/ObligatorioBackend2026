import { obtenerPerfilUsuarioService, cambiarPlanUsuarioService } from "../services/usuarios.services.js";

export const obtenerPerfilUsuario = async (req, res) => {
    const usuarioBuscado = await obtenerPerfilUsuarioService(req.decoded.id);

    res.json({message: "Obtener perfil del usuario logueado.",usuarioBuscado});
};

export const cambiarPlanUsuario = async (req, res) => {
    const { id } = req.params;
    const usuarioActualizado = await cambiarPlanUsuarioService(id,req.body,req.decoded.id);
    res.json({message: `Actualizar plan de usuario con ID: ${id}.`,usuarioActualizado});
};