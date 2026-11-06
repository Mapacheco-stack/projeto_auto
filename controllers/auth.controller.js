import prisma from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const gerarHashSenha = async (senha) => bcrypt.hash(senha, 10)
export const compararSenha = async (senha, hash) => bcrypt.compare(senha, hash)
export const gerarToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

const ERRO_CREDENCIAIS = 'usuário ou senha invalidos'
const HASH_BCRYPT = /^\$2[aby]\$\d{2}\$/

const verificarSenha = async (senha, senhaArmazenada) => {
  if (HASH_BCRYPT.test(senhaArmazenada)) {
    return compararSenha(senha, senhaArmazenada)
  }

  // Compatibilidade temporária com registos antigos que guardavam a senha
  // em texto. O valor é convertido para bcrypt após um login bem-sucedido.
  return senha === senhaArmazenada
}

export const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ statusCode: 401, erro: 'Token não informado' })

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ statusCode: 401, erro: 'Token inválido' })
    }

    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ statusCode: 401, erro: 'Token inválido' })
  }
}

export const perfilAdmin = (req, res) => {
  res.json({ autenticado: true, admin: req.admin.admin })
}

export const login = async (req, res) => {
  try {
    const { admin, senha } = req.body

    if (!admin || !senha) {
      return res.status(401).json({ statusCode: 401, erro: ERRO_CREDENCIAIS })
    }

    // No schema atual, `nome` é o login e `senha` guarda o hash bcrypt.
    // Como `nome` não é único no schema, usamos findFirst em vez de findUnique.
    const usuario = await prisma.admins.findFirst({
      where: { nome: admin }
    })

    const credencialValida = usuario
      ? await verificarSenha(senha, usuario.senha)
      : false

    if (!usuario || !credencialValida) {
      return res.status(401).json({ statusCode: 401, erro: ERRO_CREDENCIAIS })
    }

    // Gera o token antes de alterar uma senha legada. Assim, uma configuração
    // JWT incompleta não deixa a senha migrada com o login a falhar em seguida.
    const token = gerarToken({ admin: usuario.nome })

    if (!HASH_BCRYPT.test(usuario.senha)) {
      await prisma.admins.update({
        where: { senha: usuario.senha },
        data: { senha: await gerarHashSenha(senha) }
      })
    }

    res.json({ autenticado: true, token })
  } catch (error) {
    res.status(500).json({ statusCode: 500, erro: error.message })
  }
}
