import axios from "axios";

export const obtenerFraseMotivacionalService = async () => {
    try {
        const response = await axios.get("https://www.positive-api.online/phrases/esp");
        const frases = response.data;

        if (!frases || frases.length === 0) {
            throw new Error("No hay frases disponibles");
        }

        const posicionRandom = Math.floor(Math.random() * frases.length);
        const fraseElegida = frases[posicionRandom];
        return {
            frase: fraseElegida.text,
            autor: "Positive API"
        };

    } catch (error) {
        return {frase: "No te rindas, cada entrenamiento te acerca a tu mejor versión.",autor: "Sistema"};
    }
};