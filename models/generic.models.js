
import prisma from '../config/database.js'

// Mapeamento das rotas para os modelos Prisma
const modelosPrisma = {
  problemas: 'problemas',
  causas: 'causas_possiveis',
  veiculos: 'modelos_veiculos',
  fabricantes: 'fabricantes',
  prob_causa: 'problemas_causas'
}

// Obtém o modelo correspondente
const obterModelo = (tabela) => {
  const nomeModelo = modelosPrisma[tabela]

  if (!nomeModelo || !prisma[nomeModelo]) {
    throw new Error(`Tabela não permitida ou inexistente: ${tabela}`)
  }

  return prisma[nomeModelo]
}

// Identifica a chave primária
const obterWhere = (tabela, identificador) => {
  if (tabela === 'prob_causa') {
    const problema_id = Number(identificador?.problema_id)
    const causa_possivel_id = Number(identificador?.causa_possivel_id)

    if (
      !Number.isInteger(problema_id) ||
      !Number.isInteger(causa_possivel_id)
    ) {
      throw new Error('Informe problema_id e causa_possivel_id válidos.')
    }

    return {
      problema_id_causa_possivel_id: {
        problema_id,
        causa_possivel_id
      }
    }
  }

  const id = Number(identificador)

  if (!Number.isInteger(id)) {
    throw new Error('ID inválido.')
  }

  return { id }
}

// Criar registro
export const inserir = async (tabela, dados) => {
  const modelo = obterModelo(tabela)

  const result = await modelo.create({
    data: dados
  })

  return {
    criado: true,
    registro: result
  }
}

// Listar registros
export const listar = async (tabela, identificador = null) => {
  const modelo = obterModelo(tabela)

  if (identificador === null) {
    return await modelo.findMany()
  }

  return await modelo.findUnique({
    where: obterWhere(tabela, identificador)
  })
}

// Atualizar registro
export const atualizar = async (tabela, dados, identificador) => {
  const modelo = obterModelo(tabela)

  const result = await modelo.update({
    where: obterWhere(tabela, identificador),
    data: dados
  })

  return {
    atualizado: true,
    registro: result
  }
}

// Remover registro
export const remover = async (tabela, identificador) => {
  const modelo = obterModelo(tabela)

  const result = await modelo.delete({
    where: obterWhere(tabela, identificador)
  })

  return {
    excluido: true,
    registro: result
  }
}
