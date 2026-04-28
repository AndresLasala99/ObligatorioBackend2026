import jwt from "jsonwebtoken";

export const authenticateMiddleware= (req,res,next) => {
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message:"No se proporcionó un token de autenticación."});
    }
    const token= authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Token de autenticación no válido."})
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if(err){
            return res.status(401).json({message:"Token de autenticación inválido."})
        }
        req.decoded=decoded;
        next();
    })
}