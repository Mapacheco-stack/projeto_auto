import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router()

// login de admin oculto (verificação)
    router.post('/logadmin', login)

    export default router