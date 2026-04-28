import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["cliente", "entrenador"], required: true },
    plan: { type: String, enum: ["plus", "premium"], default: null },
    entrenamientosCreados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entrenamiento" }],
    inscripciones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inscripcion" }]
});

usuarioSchema.pre("save", function () {
    if (!this.isModified("password")) return
    this.password = bcrypt.hashSync(this.password, Number(process.env.SALT_ROUNDS));
});

export default mongoose.model("Usuario", usuarioSchema);//entrenamientos