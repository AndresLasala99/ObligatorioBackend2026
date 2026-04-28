import Joi from "joi"

export const cambiarPlanSchema = Joi.object({
    plan: Joi.string().valid("plus", "premium").required().messages({
        "string.base":"El plan debe ser un texto.",
        "string.empty":"El plan no puede estar vacío.",
        "any.only": "Los únicos planes permitidos son plus o premium.",
        "any.required": "El plan es obligatorio."
    })
});