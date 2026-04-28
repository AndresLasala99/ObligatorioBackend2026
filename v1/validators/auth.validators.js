import Joi from 'joi';

export const registerSchema = Joi.object({
    nombre: Joi.string().trim().min(3).max(50).required().messages({
        "string.base": "El nombre debe ser un texto.",
        "string.empty": "El nombre no puede estar vacío.",
        "string.min": "El nombre debe tener al menos {#limit} caracteres.",
        "string.max": "El nombre no puede tener más de {#limit} caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    email: Joi.string().trim().email().required().messages({
        "string.base": "El email debe ser un texto.",
        "string.empty": "El email no puede estar vacío.",
        "string.email": "El email no tiene un formato válido.",
        "any.required": "El email es obligatorio."
    }),
    password: Joi.string().trim().min(6).max(50).pattern(/^(?=.*[A-Z])(?=.*\d).+$/).required().messages({
        "string.base": "La contraseña debe ser un texto.",
        "string.empty": "La contraseña no puede estar vacía.",
        "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
        "string.max": "La contraseña no puede tener más de {#limit} caracteres.",
        "string.pattern.base": "La contraseña debe tener al menos una mayúscula y un número.",
        "any.required": "La contraseña es obligatoria."
    }),
    confirmPassword: Joi.string().trim().valid(Joi.ref("password")).required().messages({
        "string.base": "La confirmación de contraseña debe ser un texto.",
        "any.only": "Las contraseñas no coinciden.",
        "any.required": "Debes confirmar la contraseña."
    }),
    rol: Joi.string().trim().valid("cliente", "entrenador").required().messages({
        "string.base": "El rol debe ser un texto.",
        "string.empty": "El rol no puede estar vacío.",
        "any.only": "El rol debe ser cliente o entrenador.",
        "any.required": "El rol es obligatorio."
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        "string.base": "El email debe ser un texto.",
        "string.empty":"El email no puede estar vacío.",
        "string.email": "El email no tiene un formato válido.",
        "any.required": "El email es obligatorio."
    }),
    password: Joi.string().trim().min(6).max(50).required().messages({
        "string.base": "La contraseña debe ser un texto.",
        "string.empty": "La contraseña no puede estar vacía.",
        "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
        "string.max": "La contraseña no puede tener más de {#limit} caracteres.",
        "any.required": "La contraseña es obligatoria."
    })
});

