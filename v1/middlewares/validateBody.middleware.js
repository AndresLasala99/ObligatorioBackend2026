export const validateBodyMiddleware= (schema) => {
    return (req,res,next) => {
        const {error,value} = schema.validate(req.body, {abortEarly: false});
        if(error){
            return res.status(400).json({message: "Error de validación", error: error.details})
        }
        req.body=value;
        next();
    }
}