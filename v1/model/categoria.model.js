import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    entrenamientos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entrenamiento" }],
    imagen: { type: String }
});

export default mongoose.model("Categoria", categoriaSchema);