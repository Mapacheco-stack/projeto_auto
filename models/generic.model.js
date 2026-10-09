import prisma from '../config/database.js' 

// Mapeia o nome que vem da Rota (plural) para o nome do Model no Prisma (singular)
const modelosPrisma = {
 problema
}

export const inserir = async (tabela, dados) => {
  const modelo = modelosPrisma[tabela]
  
  // O Prisma já identifica os campos, descarta o que não existe e faz o INSERT
  const result = await prisma[modelo].create({
    data: dados
  })
  
  return { id: result.id, criado: true }
}

export const listar = async (tabela, id = null) => {
  const modelo = modelosPrisma[tabela]
  
  if (id) {
    // Busca por ID (O Prisma exige que o ID seja numérico, por isso o Number)
    return await prisma[modelo].findUnique({
      where: { id: Number(id) }
    })
  }
  
  // Se não tem ID, lista todos (Equivalente ao SELECT * FROM tabela)
  return await prisma[modelo].findMany()
}

export const atualizar = async (tabela, dados, id) => {
  const modelo = modelosPrisma[tabela]
  
  // O Prisma atualiza apenas os campos que vieram dentro de "dados"
  await prisma[modelo].update({
    where: { id: Number(id) },
    data: dados
  })
  
  return { atualizado: true }
}

export const remover = async (tabela, id) => {
  const modelo = modelosPrisma[tabela]
  
  await prisma[modelo].delete({
    where: { id: Number(id) }
  })
  
  return { excluido: true }
}