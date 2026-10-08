export const gerarHashSenha = async (senha) =>bcrypt.hash(senha, 10)
// Compara senha com hash
export const compararSenha = async (senha, hash) =>bcrypt.compare(senha, hash)

// Gera token JWT
export const gerarToken = (payload) =>jwt.sign(
        payload, 
        process.env.JWT_SECRET || '{$Chave_Secreta$}', 
        {expiresIn: '8h'}
      )

// Middleware de autenticação
export const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        erro: 'Token não informado'
      })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET  || '{$Chave_Secreta$}')
    next()
  } catch (error) {
    return res.status(401).json({
      erro: 'Token inválido'
    })
  }
}

// Realiza login
export const login = async (req, res) => {
  try {
    const { admin, senha } = req.body

    const { rows: admins } = await pool.query(
      'SELECT * FROM admins WHERE senha = $1',
      [email]
    )

    if (!usuarios.length) {
      return res.status(401).json({
        erro: 'Usuário não encontrado'
      })
    }

    const usuario = usuarios[0]

    const senhaValida = await compararSenha(
      senha,
      usuario.senha
    )

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Senha inválida'
      })
    }

    const token = gerarToken({
      id: usuario.id,
      email: usuario.email
    })

    res.json({
      autenticado: true,
      token
    })
  } catch (error) {
    res.status(500).json({
      erro: error.message
    })
  }
}