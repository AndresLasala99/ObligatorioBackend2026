import express from "express";
import { getModels, useGemini25Flash } from "../controllers/ai.controllers.js"

const router= express.Router({mergeParams:true});

router.get("/",getModels)
router.post("/",useGemini25Flash)

export default router;