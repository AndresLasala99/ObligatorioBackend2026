import Joi from "joi";

export const agregarEntrenamientoSchema = Joi.object({
    titulo: Joi.string().trim().min(3).max(50).required().messages({
        "string.base": "El título debe ser un texto.",
        "string.empty": "El título no puede estar vacío.",
        "string.min": "El título debe tener al menos 3 caracteres.",
        "string.max": "El título no puede tener más de 50 caracteres.",
        "any.required": "El título es obligatorio."
    }),
    descripcion: Joi.string().trim().max(200).required().messages({
        "string.base": "La descripción debe ser un texto.",
        "string.empty": "La descripción no puede estar vacía.",
        "string.max": "La descripción no puede tener más de 200 caracteres.",
        "any.required": "La descripción es obligatoria."
    }),
    nivel: Joi.string().valid("principiante", "intermedio", "avanzado").required().messages({
        "string.base": "El nivel debe ser un texto.",
        "any.only": "El nivel debe ser principiante, intermedio o avanzado.",
        "any.required": "El nivel es obligatorio."
    }),
    duracionMinutos: Joi.number().integer().positive().required().messages({
        "number.base": "La duración debe ser un número.",
        "number.integer": "La duración debe ser un número entero.",
        "number.positive": "La duración debe ser mayor a 0.",
        "any.required": "La duración es obligatoria."
    }),
    cupoMaximo: Joi.number().integer().min(1).required().messages({
        "number.base": "El cupo debe ser un número.",
        "number.integer": "El cupo debe ser un número entero.",
        "number.min": "El cupo debe ser al menos 1.",
        "any.required": "El cupo es obligatorio."
    }),
    fecha: Joi.date().iso().required().messages({
        "date.base": "La fecha debe tener un formato válido.",
        "date.format": "La fecha debe estar en formato ISO.",
        "any.required": "La fecha es obligatoria."
    }),
    categoria: Joi.string().required().messages({
        "string.base": "La categoría debe ser un texto.",
        "string.empty": "La categoría no puede estar vacía.",
        "any.required": "La categoría es obligatoria."
    }),
    imagen: Joi.string().uri().messages({
        "string.base": "La imagen debe ser un texto.",
        "string.uri": "La imagen debe ser una URL válida."
    })
});

export const modificarEntrenamientoSchema = Joi.object({
    titulo: Joi.string().trim().min(3).max(50).messages({
        "string.base": "El título debe ser un texto.",
        "string.empty": "El título no puede estar vacío.",
        "string.min": "El título debe tener al menos 3 caracteres.",
        "string.max": "El título no puede tener más de 50 caracteres."
    }),
    descripcion: Joi.string().trim().max(200).messages({
        "string.base": "La descripción debe ser un texto.",
        "string.empty": "La descripción no puede estar vacía.",
        "string.max": "La descripción no puede tener más de 200 caracteres."
    }),
    nivel: Joi.string().valid("principiante", "intermedio", "avanzado").messages({
        "string.base": "El nivel debe ser un texto.",
        "any.only": "El nivel debe ser principiante, intermedio o avanzado."
    }),
    duracionMinutos: Joi.number().integer().positive().messages({
        "number.base": "La duración debe ser un número.",
        "number.integer": "La duración debe ser un número entero.",
        "number.positive": "La duración debe ser mayor a 0."
    }),
    cupoMaximo: Joi.number().integer().min(1).messages({
        "number.base": "El cupo debe ser un número.",
        "number.integer": "El cupo debe ser un número entero.",
        "number.min": "El cupo debe ser al menos 1."
    }),
    fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/).messages({
        "string.empty": "La fecha no puede estar vacía.",
        "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD HH:mm",
    }),
    categoria: Joi.string().messages({
        "string.base": "La categoría debe ser un texto.",
        "string.empty": "La categoría no puede estar vacía.",
    }),
    imagen: Joi.string().uri().messages({
        "string.base": "La imagen debe ser un texto.",
        "string.uri": "La imagen debe ser una URL válida."
    })
}).min(1).messages({
    "object.min": "Debes enviar al menos un campo para modificar."
});
