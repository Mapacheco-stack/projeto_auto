import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/auth.routes.js'
import genericRoutes from './routes/generic.routes.js'

const app = express()

// Obtém diretório atual
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Disponibiliza arquivos estáticos
app.use(express.static(path.join(__dirname, 'views')))

// Página inicial pública. O frontend é opcional no pacote do backend:
// quando views/index.html existir, ele é servido; caso contrário, a API
// continua funcional e informa como está disponível.
const frontendPath = path.join(__dirname, 'views', 'index.html')
app.get('/', (req, res) => {
  if (fs.existsSync(frontendPath)) {
    return res.sendFile(frontendPath)
  }

  return res.json({
    nome: 'AutoWiki API',
    status: 'online',
    mensagem: 'Frontend não incluído neste pacote do backend.'
  })
})

// Rotas públicas de autenticação
app.use('/', authRoutes)

// Rotas da API
app.use('/', genericRoutes)

export default app
