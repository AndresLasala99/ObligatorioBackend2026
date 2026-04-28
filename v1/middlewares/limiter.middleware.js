import rateLimit from "express-rate-limit";

const limiter= rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // maximo 10 request por IP
    message: "Demasiadas solicitudes desde esta IP, intenta más tarde."
})

export default limiter;