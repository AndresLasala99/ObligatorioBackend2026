import mongoose from "mongoose";

const entrenamientoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    nivel: { type: String, required: true },
    duracionMinutos: { type: Number, required: true },
    cupoMaximo: { type: Number, required: true, default: 10 },
    fecha: { type: Date, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria", required: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    inscriptos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    imagen: { type: String }
});

entrenamientoSchema.virtual("cuposDisponibles").get(function () {
    const cupoMaximo = this.cupoMaximo || 10;
    const cantidadInscriptos = this.inscriptos?.length || 0;
    return Math.max(cupoMaximo - cantidadInscriptos, 0);
});

entrenamientoSchema.virtual("sinCupos").get(function () {
    return this.cuposDisponibles <= 0;
});

entrenamientoSchema.virtual("finalizado").get(function () {
    return new Date(this.fecha) < new Date();
});

entrenamientoSchema.set("toJSON", { virtuals: true });
entrenamientoSchema.set("toObject", { virtuals: true });

export default mongoose.model("Entrenamiento", entrenamientoSchema);//entrenamientos
