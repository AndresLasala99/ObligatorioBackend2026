import mongoose from "mongoose";

const inscripcionSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    entrenamiento: { type: mongoose.Schema.Types.ObjectId, ref: "Entrenamiento", required: true },
    fechaInscripcion: { type: Date, default: Date.now },
    estado: { type: String, enum: ["activa", "cancelada"], default: "activa" }
});

inscripcionSchema.virtual("estadoVisual").get(function () {
    if (this.estado === "cancelada") return "Cancelada";
    if (this.entrenamiento?.fecha && new Date(this.entrenamiento.fecha) < new Date()) return "Finalizada";
    return "Activa";
});

inscripcionSchema.set("toJSON", { virtuals: true });
inscripcionSchema.set("toObject", { virtuals: true });

export default mongoose.model("Inscripcion", inscripcionSchema, "inscripciones");
