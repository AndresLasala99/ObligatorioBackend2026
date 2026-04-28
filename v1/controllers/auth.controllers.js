import { registrarUsuarioService, loginUsuarioService } from "../services/auth.services.js"

export const registrarUsuario= async (req,res) => {
    const {usuario, token} = await registrarUsuarioService(req.body);
    res.json({message: "Usuario registrado correctamente.", usuario, token});
}

export const loginUsuario = async (req,res) => {
    const { email, password } = req.body;
    const { usuario, token }= await loginUsuarioService(email,password);
    res.json({ message: "Usuario logueado correctamente.", usuario, token}); 
}