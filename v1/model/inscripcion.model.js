import mongoose from "mongoose";

const inscripcionSchema = new mongoose.Schema({
    usuario: {type: mongoose.Schema.Types.ObjectId,ref: "Usuario",required: true},
    entrenamiento: {type: mongoose.Schema.Types.ObjectId,ref: "Entrenamiento",required: true},
    fechaInscripcion: {type: Date,default: Date.now}
});

export default mongoose.model("Inscripcion", inscripcionSchema);