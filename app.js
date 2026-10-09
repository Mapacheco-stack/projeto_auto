import express from 'express'
import cors from 'cors'
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

// Página inicial pública
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

// Rotas públicas de autenticação
app.use('/', authRoutes)

// Rotas da API
app.use('/', genericRoutes)

export default app
