import { useGemini25FlashService } from "../services/ai.services.js";

export const getModels = (req, res) => {
    res.json({ message: "List of AI models" });
};

export const useGemini25Flash = async (req, res) => {
    const { prompt } = req.body;

    const respuestaIA = await useGemini25FlashService(prompt);

    res.status(200).json({
        message: "Gemini 2.5 Flash response",
        final: respuestaIA
    });
};