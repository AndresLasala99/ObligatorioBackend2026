import { obtenerPerfilUsuarioService, cambiarPlanUsuarioService, actualizarFotoPerfilUsuarioService, cambiarPasswordUsuarioService } from "../services/usuarios.services.js";

export const obtenerPerfilUsuario = async (req, res) => {
    const usuarioBuscado = await obtenerPerfilUsuarioService(req.decoded.id);

    res.json({message: "Obtener perfil del usuario logueado.",usuarioBuscado});
};

export const cambiarPlanUsuario = async (req, res) => {
    const { id } = req.params;
    const usuarioActualizado = await cambiarPlanUsuarioService(id,req.body,req.decoded.id);
    res.json({message: `Actualizar plan de usuario con ID: ${id}.`,usuarioActualizado});
};

export const actualizarFotoPerfilUsuario = async (req, res) => {
    const usuarioActualizado = await actualizarFotoPerfilUsuarioService(req.body,req.decoded.id);
    res.json({message: "Foto de perfil actualizada correctamente.",usuarioActualizado});
};

export const cambiarPasswordUsuario = async (req, res) => {
    const usuarioActualizado = await cambiarPasswordUsuarioService(req.body,req.decoded.id);
    res.json({message: "Contraseña actualizada correctamente.",usuarioActualizado});
};
