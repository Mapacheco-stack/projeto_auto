import { Router } from "express";
import { autenticar, login, perfilAdmin } from "../controllers/auth.controller.js";

const router = Router()

router.get('/logadmin', (req, res) => {
  res.status(405).json({
    statusCode: 405,
    erro: 'Use POST /logadmin com { "admin": "...", "senha": "..." } para iniciar sessão.'
  })
})

router.post('/logadmin', login)
router.get('/admin/me', autenticar, perfilAdmin)

export default router
