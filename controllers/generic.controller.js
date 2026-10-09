import * as model from '../models/generic.model.js'
import { gerarHashSenha } from './auth.controller.js'

// Cria novo registro
export const criar = async (req, res) => {
  try {
    const dados = { ...req.body }

    // Criptografa senha automaticamente
    if (dados.senha) {
      dados.senha = await gerarHashSenha(dados.senha)
    }

    const result = await model.inserir(
      req.params.tabela || req.path.replace('/', ''),
      dados
    )

    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Lista registros
export const listar = async (req, res) => {
  try {
    const result = await model.listar(
      req.params.tabela || req.path.replace('/', ''),
      req.params.id
    )

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Atualiza registro
export const atualizar = async (req, res) => {
  try {
    const dados = { ...req.body }

    // Atualiza senha com hash
    if (dados.senha) {
      dados.senha = await gerarHashSenha(dados.senha)
    }

    const result = await model.atualizar(
      req.params.tabela,
      dados,
      req.params.id
    )

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Remove registro
export const remover = async (req, res) => {
  try {
    const result = await model.remover(
      req.params.tabela,
      req.params.id
    )

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}
