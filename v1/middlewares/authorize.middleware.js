const authorizeMiddleware = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.decoded.rol)) {
            return res.status(403).json({message: "No tienes permisos para esta acción."})
        }
        next();
    };
};

export default authorizeMiddleware;