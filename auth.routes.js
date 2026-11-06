import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router()

// Informação para quem abre a rota diretamente no navegador.
// O login efetivo continua a ser feito exclusivamente via POST.
router.get('/logadmin', (req, res) => {
  res.status(405).json({
    statusCode: 405,
    erro: 'Use POST /logadmin com { "admin": "...", "senha": "..." } para iniciar sessão.'
  })
})

// Login de administrador.
router.post('/logadmin', login)

export default router
