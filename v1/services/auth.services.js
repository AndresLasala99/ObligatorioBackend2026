import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Usuario from "../model/usuario.model.js";

export const registrarUsuarioService = async (usuario) => {
    const usuarioExistente = await Usuario.findOne({ email: usuario.email });
    if (usuarioExistente) {
        const errorUsuarioExistente = new Error("Ya existe usuario con ese email.");
        errorUsuarioExistente.status = 409;
        errorUsuarioExistente.details = { email: usuario.email };
        throw errorUsuarioExistente;
    }

    const nuevoUsuario = new Usuario(usuario);
    if (nuevoUsuario.rol === "entrenador") {
        nuevoUsuario.plan = "plus";
    } else {
        nuevoUsuario.plan = null;
    }

    await nuevoUsuario.save();

    const token = jwt.sign({ id: nuevoUsuario._id, rol: nuevoUsuario.rol }, process.env.SECRET_KEY, { expiresIn: "1d" });

    const usuarioRespuesta = {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        plan: nuevoUsuario.plan
    };

    return { usuario: usuarioRespuesta, token };
};


export const loginUsuarioService = async (email, password) => {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const errorUsuarioInexistente = new Error("No existe usuario con ese email.");
        errorUsuarioInexistente.status = 404;
        errorUsuarioInexistente.details = { email };
        throw errorUsuarioInexistente;
    }

    const isMatch = bcrypt.compareSync(password, usuario.password);
    if (!isMatch) {
        const errorContraseñaIncorrecta = new Error("Contraseña inválida.");
        errorContraseñaIncorrecta.status = 401;
        throw errorContraseñaIncorrecta;
    }

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.SECRET_KEY, { expiresIn: "1d" });

    const usuarioRespuesta = {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        plan: usuario.plan
    };
    return { usuario: usuarioRespuesta, token };
};