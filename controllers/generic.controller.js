
import * as model from '../models/generic.models.js'
import { gerarHashSenha } from './auth.controller.js'

// Identifica a tabela correspondente à rota
const obterTabela = (req) => {
  return req.params.tabela || req.route.path.split('/')[1]
}

// Identifica a chave primária
const obterIdentificador = (req, tabela) => {
  if (tabela === 'prob_causa') {
    if (
      !req.params.problema_id ||
      !req.params.causa_possivel_id
    ) {
      return null
    }

    return {
      problema_id: req.params.problema_id,
      causa_possivel_id: req.params.causa_possivel_id
    }
  }

  return req.params.id || null
}

// Criar registro
export const criar = async (req, res) => {
  try {
    const dados = { ...req.body }

    if (dados.senha) {
      dados.senha = await gerarHashSenha(dados.senha)
    }

    const result = await model.inserir(
      obterTabela(req),
      dados
    )

    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Listar registros
export const listar = async (req, res) => {
  try {
    const tabela = obterTabela(req)

    const result = await model.listar(
      tabela,
      obterIdentificador(req, tabela)
    )

    if (result === null) {
      return res.status(404).json({
        erro: 'Registro não encontrado.'
      })
    }

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Atualizar registro
export const atualizar = async (req, res) => {
  try {
    const dados = { ...req.body }
    const tabela = obterTabela(req)

    if (dados.senha) {
      dados.senha = await gerarHashSenha(dados.senha)
    }

    const result = await model.atualizar(
      tabela,
      dados,
      obterIdentificador(req, tabela)
    )

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}

// Remover registro
export const remover = async (req, res) => {
  try {
    const tabela = obterTabela(req)

    const result = await model.remover(
      tabela,
      obterIdentificador(req, tabela)
    )

    res.json(result)
  } catch (error) {
    res.status(400).json({
      erro: error.message
    })
  }
}
