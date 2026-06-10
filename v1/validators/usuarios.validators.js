import Joi from "joi"

export const cambiarPlanSchema = Joi.object({
    plan: Joi.string().valid("plus", "premium").required().messages({
        "string.base":"El plan debe ser un texto.",
        "string.empty":"El plan no puede estar vacÃ­o.",
        "any.only": "Los Ãºnicos planes permitidos son plus o premium.",
        "any.required": "El plan es obligatorio."
    })
});

export const actualizarFotoPerfilSchema = Joi.object({
    fotoPerfil: Joi.string().allow("").uri().required().messages({
        "string.base":"La foto de perfil debe ser un texto.",
        "string.uri":"La foto de perfil debe ser una URL valida.",
        "any.required":"La foto de perfil es obligatoria."
    })
});

export const cambiarPasswordSchema = Joi.object({
    passwordActual: Joi.string().trim().required().messages({
        "string.empty": "La contraseña actual es obligatoria.",
        "any.required": "La contraseña actual es obligatoria."
    }),
    passwordNueva: Joi.string().trim().min(6).max(50).pattern(/^(?=.*[A-Z])(?=.*\d).+$/).required().messages({
        "string.empty": "La nueva contraseña es obligatoria.",
        "string.min": "La nueva contraseña debe tener al menos {#limit} caracteres.",
        "string.max": "La nueva contraseña no puede tener mas de {#limit} caracteres.",
        "string.pattern.base": "La nueva contraseña debe tener al menos una mayuscula y un numero.",
        "any.required": "La nueva contraseña es obligatoria."
    }),
    confirmarPasswordNueva: Joi.string().trim().valid(Joi.ref("passwordNueva")).required().messages({
        "any.only": "Las contraseñas nuevas no coinciden.",
        "any.required": "Debes repetir la nueva contraseña."
    })
});
