import Joi from "joi";

export const inscripcionSchema = Joi.object({
    idEntrenamiento: Joi.string().required().messages({
        "string.base": "El ID del entrenamiento debe ser un texto.",
        "string.empty": "El ID del entrenamiento es obligatorio.",
        "any.required": "El ID del entrenamiento es obligatorio."
    })
});