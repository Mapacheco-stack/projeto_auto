import prisma from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const gerarHashSenha = async (senha) => bcrypt.hash(senha, 10)
export const compararSenha = async (senha, hash) => bcrypt.compare(senha, hash)
export const gerarToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

export const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ statusCode: 401, erro: 'Token não informado' })

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET)
    next() 
  } catch (error) {
    return res.status(401).json({ statusCode: 401, erro: 'Token inválido' })
  }
}

export const login = async (req, res) => {
  try {
    const { admin, senha } = req.body

    // Aqui está a mágica do Prisma! Adeus "SELECT * FROM usuarios WHERE email = ?"
    const usuario = await prisma.admin.findUnique({
      where: { admins: admin } //
    })

    if (!usuario) {
      return res.status(401).json({ statusCode: 401, erro: 'Você não foi identificado como um administrador' })
    }

    const senhaValida = await compararSenha(senha, admin.senha)

    if (!senhaValida) {
      return res.status(401).json({ statusCode: 401, erro: 'Senha inválida' })
    }

    const token = gerarToken({ id: admin.id, admin: admins.admin }) //aqui oadmins se refere a tabela e o segundo ao campo
    res.json({ autenticado: true, token })                           //eu acabei colocando o nome da tabela de admin e o campo que se refere ao nome do    administrador como admin
  } catch (error) {
    res.status(500).json({ statusCode: 500, erro: error.message })
  }
}