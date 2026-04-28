import { obtenerFraseMotivacionalService } from "../services/frasesMotivacionales.services.js";

export const obtenerFraseMotivacional = async (req, res) => {
    const frase = await obtenerFraseMotivacionalService();
    res.status(200).json({ message: "Frase motivacional obtenida correctamente.", frase: frase });
};