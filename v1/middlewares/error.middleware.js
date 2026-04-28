    export const errorMiddleware=(err,req,res,next) => {
        //solo en development
        console.log(err.stack);
        res.status(err.status || 500).json({
            message: err.message || "Error interno del servidor",
            details: err.details || null
        })
    }