import mongoose from "mongoose";

const entrenamientoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    nivel: { type: String, required: true },
    duracionMinutos: { type: Number, required: true },
    fecha: { type: Date, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria", required: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    imagen: { type: String }
});

export default mongoose.model("Entrenamiento", entrenamientoSchema);//entrenamientos