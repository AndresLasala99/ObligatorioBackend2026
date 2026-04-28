import Joi from "joi";

export const agregarCategoriaSchema = Joi.object({
    nombre: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": "El nombre debe ser un texto.",
        "string.empty": "El nombre no puede estar vacío.",
        "string.min": "El nombre debe tener al menos 3 caracteres.",
        "string.max": "El nombre no puede tener más de 30 caracteres.",
        "any.required": "El nombre es obligatorio."
    }) ,
    descripcion: Joi.string().trim().max(100).optional().messages({
        "string.base": "La descripción debe ser un texto.",
        "string.max": "La descripción no puede tener más de 100 caracteres."
    }),
    imagen: Joi.string().uri().messages({
        "string.base": "La imagen debe ser un texto.",
        "string.uri": "La imagen debe ser una URL válida."
    })
});

export const modificarCategoriaSchema = Joi.object({
    nombre: Joi.string().trim().min(3).max(30).messages({
        "string.base": "El nombre debe ser un texto.",
        "string.empty": "El nombre no puede estar vacío.",
        "string.min": "El nombre debe tener al menos 3 caracteres.",
        "string.max": "El nombre no puede tener más de 30 caracteres."
    }),
    descripcion: Joi.string().trim().max(100).messages({
        "string.base": "La descripción debe ser un texto.",
        "string.max": "La descripción no puede tener más de 100 caracteres."
    }),
    imagen: Joi.string().uri().messages({
        "string.base": "La imagen debe ser un texto.",
        "string.uri": "La imagen debe ser una URL válida."
    })
}).min(1).messages({
    "object.min": "Debes enviar al menos un campo para modificar."
});