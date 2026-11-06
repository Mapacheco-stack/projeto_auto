const formLogin = document.querySelector('#login-admin')
const loginButton = document.querySelector('#login-button')
const message = document.querySelector('#mensagem')
const session = document.querySelector('#sessao')
const sessionText = document.querySelector('#sessao-texto')
const logoutButton = document.querySelector('#logout-button')
const panel = document.querySelector('#painel')
const TOKEN_KEY = 'autowiki.adminToken'

const state = {
  fabricantes: [],
  veiculos: [],
  problemas: [],
  causas: [],
  relacoes: []
}

function mostrarMensagem(texto, tipo = '') {
  message.textContent = texto
  message.className = `admin-message ${tipo}`.trim()
}

function obterToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function limparSessao() {
  localStorage.removeItem(TOKEN_KEY)
  session.hidden = true
  panel.hidden = true
  sessionText.textContent = ''
}

// Todas as operações administrativas passam por aqui e recebem o JWT.
async function apiAdmin(path, options = {}) {
  const token = obterToken()
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(path, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (response.status === 401) limparSessao()
  if (!response.ok) throw new Error(data.erro || `Pedido recusado (HTTP ${response.status}).`)
  return data
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

function inteiroOuNulo(valor) {
  if (valor === '' || valor === null || valor === undefined) return null
  const numero = Number(valor)
  return Number.isInteger(numero) ? numero : null
}

function booleano(form, nome) {
  return form.elements[nome].checked
}

function criarTabela(container, colunas, linhas, acoes = {}) {
  container.replaceChildren()
  if (!linhas.length) {
    const vazio = document.createElement('p')
    vazio.className = 'empty'
    vazio.textContent = 'Nenhum registro cadastrado.'
    container.append(vazio)
    return
  }

  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  colunas.forEach((coluna) => {
    const th = document.createElement('th')
    th.textContent = coluna.label
    headRow.append(th)
  })
  if (acoes.editar || acoes.excluir) {
    const th = document.createElement('th')
    th.textContent = 'Ações'
    headRow.append(th)
  }
  thead.append(headRow)
  table.append(thead)

  const tbody = document.createElement('tbody')
  linhas.forEach((linha) => {
    const tr = document.createElement('tr')
    colunas.forEach((coluna) => {
      const td = document.createElement('td')
      const valor = coluna.value ? coluna.value(linha) : linha[coluna.key]
      td.textContent = valor === null || valor === undefined || valor === '' ? '—' : String(valor)
      tr.append(td)
    })
    if (acoes.editar || acoes.excluir) {
      const td = document.createElement('td')
      td.className = 'actions'
      if (acoes.editar) {
        const editar = document.createElement('button')
        editar.className = 'admin-button small secondary'
        editar.type = 'button'
        editar.textContent = 'Editar'
        editar.addEventListener('click', () => acoes.editar(linha))
        td.append(editar)
      }
      if (acoes.excluir) {
        const excluir = document.createElement('button')
        excluir.className = 'admin-button small danger'
        excluir.type = 'button'
        excluir.textContent = 'Excluir'
        excluir.addEventListener('click', () => acoes.excluir(linha))
        td.append(excluir)
      }
      tr.append(td)
    }
    tbody.append(tr)
  })
  table.append(tbody)
  container.append(table)
}

function preencherSelect(select, itens, texto, label = 'nome') {
  select.replaceChildren(new Option(texto, ''))
  itens.forEach((item) => select.add(new Option(item[label], item.id)))
}

function atualizarSelects() {
  preencherSelect(document.querySelector('[name="fabricante_id"]'), state.fabricantes, 'Selecione o fabricante')
  preencherSelect(document.querySelector('#form-relacoes [name="problema_id"]'), state.problemas, 'Selecione o problema')
  preencherSelect(document.querySelector('#form-relacoes [name="causa_possivel_id"]'), state.causas, 'Selecione a causa')
}

function nomeFabricante(id) {
  return state.fabricantes.find((item) => Number(item.id) === Number(id))?.nome || `#${id}`
}

function nomeProblema(id) {
  return state.problemas.find((item) => Number(item.id) === Number(id))?.nome || `#${id}`
}

function nomeCausa(id) {
  return state.causas.find((item) => Number(item.id) === Number(id))?.nome || `#${id}`
}

function renderizarListas() {
  criarTabela(document.querySelector('#lista-fabricantes'), [
    { label: 'ID', key: 'id' }, { label: 'Nome', key: 'nome' }, { label: 'Ativo', value: (item) => item.ativo ? 'Sim' : 'Não' }
  ], state.fabricantes, { editar: editarFabricante, excluir: (item) => excluirRegistro('fabricantes', item) })

  criarTabela(document.querySelector('#lista-veiculos'), [
    { label: 'ID', key: 'id' }, { label: 'Fabricante', value: (item) => nomeFabricante(item.fabricante_id) }, { label: 'Modelo', key: 'nome' }, { label: 'Anos', value: (item) => `${item.ano_inicio || '—'}–${item.ano_fim || '—'}` }
  ], state.veiculos, { editar: editarVeiculo, excluir: (item) => excluirRegistro('veiculos', item) })

  criarTabela(document.querySelector('#lista-problemas'), [
    { label: 'ID', key: 'id' }, { label: 'Nome', key: 'nome' }, { label: 'Urgência', key: 'nivel_urgencia' }, { label: 'Ativo', value: (item) => item.ativo ? 'Sim' : 'Não' }
  ], state.problemas, { editar: editarProblema, excluir: (item) => excluirRegistro('problemas', item) })

  criarTabela(document.querySelector('#lista-causas'), [
    { label: 'ID', key: 'id' }, { label: 'Nome', key: 'nome' }, { label: 'Gravidade', key: 'nivel_gravidade' }, { label: 'Ativo', value: (item) => item.ativo ? 'Sim' : 'Não' }
  ], state.causas, { editar: editarCausa, excluir: (item) => excluirRegistro('causas', item) })

  criarTabela(document.querySelector('#lista-relacoes'), [
    { label: 'Problema', value: (item) => nomeProblema(item.problema_id) },
    { label: 'Causa', value: (item) => nomeCausa(item.causa_possivel_id) },
    { label: 'Ordem', key: 'ordem_exibicao' }
  ], state.relacoes, { editar: editarRelacao, excluir: excluirRelacao })
  atualizarSelects()
}

async function carregarDados() {
  const [fabricantes, veiculos, problemas, causas, relacoes] = await Promise.all([
    apiAdmin('/fabricantes'), apiAdmin('/veiculos'), apiAdmin('/problemas'), apiAdmin('/causas'), apiAdmin('/prob_causa')
  ])
  state.fabricantes = fabricantes
  state.veiculos = veiculos
  state.problemas = problemas
  state.causas = causas
  state.relacoes = relacoes
  renderizarListas()
}

function formularioBase(form, id) {
  const dados = Object.fromEntries(new FormData(form).entries())
  delete dados.id
  if (id) return { id: Number(id), dados }
  return { id: null, dados }
}

async function salvarRecurso({ form, path, preparar }) {
  const { id, dados } = formularioBase(form, form.elements.id.value)
  const corpo = preparar(dados, form)
  const resposta = await apiAdmin(id ? `${path}/${id}` : path, jsonOptions(id ? 'PUT' : 'POST', corpo))
  form.reset()
  form.elements.id.value = ''
  await carregarDados()
  mostrarMensagem(resposta.atualizado || resposta.criado ? 'Registro salvo com sucesso.' : 'Operação concluída.', 'success')
}

function editarFabricante(item) {
  const form = document.querySelector('#form-fabricantes')
  form.elements.id.value = item.id; form.elements.nome.value = item.nome; form.elements.ativo.checked = item.ativo
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function editarVeiculo(item) {
  const form = document.querySelector('#form-veiculos')
  form.elements.id.value = item.id; form.elements.fabricante_id.value = item.fabricante_id; form.elements.nome.value = item.nome
  form.elements.ano_inicio.value = item.ano_inicio ?? ''; form.elements.ano_fim.value = item.ano_fim ?? ''; form.elements.ativo.checked = item.ativo
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function editarProblema(item) {
  const form = document.querySelector('#form-problemas')
  form.elements.id.value = item.id; form.elements.nome.value = item.nome; form.elements.descricao.value = item.descricao || ''
  form.elements.nivel_urgencia.value = item.nivel_urgencia; form.elements.ativo.checked = item.ativo
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function editarCausa(item) {
  const form = document.querySelector('#form-causas')
  form.elements.id.value = item.id; form.elements.nome.value = item.nome; form.elements.resumo.value = item.resumo
  form.elements.recomendacao.value = item.recomendacao; form.elements.nivel_gravidade.value = item.nivel_gravidade; form.elements.ativo.checked = item.ativo
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function editarRelacao(item) {
  const form = document.querySelector('#form-relacoes')
  form.elements.relacao_problema_id.value = item.problema_id
  form.elements.relacao_causa_possivel_id.value = item.causa_possivel_id
  form.elements.problema_id.value = item.problema_id
  form.elements.causa_possivel_id.value = item.causa_possivel_id
  form.elements.problema_id.disabled = true
  form.elements.causa_possivel_id.disabled = true
  form.elements.ordem_exibicao.value = item.ordem_exibicao
  document.querySelector('#salvar-relacao').textContent = 'Salvar relação'
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function limparFormularioRelacao() {
  const form = document.querySelector('#form-relacoes')
  form.reset()
  form.elements.problema_id.disabled = false
  form.elements.causa_possivel_id.disabled = false
  form.elements.relacao_problema_id.value = ''
  form.elements.relacao_causa_possivel_id.value = ''
  document.querySelector('#salvar-relacao').textContent = 'Criar relação'
}

async function excluirRegistro(path, item) {
  if (!confirm('Tem certeza de que deseja excluir este registro?')) return
  await apiAdmin(`/${path}/${item.id}`, { method: 'DELETE' })
  await carregarDados()
  mostrarMensagem('Registro excluído com sucesso.', 'success')
}

async function excluirRelacao(item) {
  if (!confirm('Tem certeza de que deseja excluir esta relação?')) return
  await apiAdmin(`/prob_causa/${item.problema_id}/${item.causa_possivel_id}`, { method: 'DELETE' })
  await carregarDados()
  mostrarMensagem('Relação excluída com sucesso.', 'success')
}

async function carregarSessao() {
  if (!obterToken()) return
  try {
    const data = await apiAdmin('/admin/me')
    sessionText.textContent = `Sessão ativa para: ${data.admin}`
    session.hidden = false
    panel.hidden = false
    await carregarDados()
    mostrarMensagem('Sessão recuperada. Você já pode usar o CRUD abaixo.', 'success')
  } catch (error) {
    limparSessao()
    mostrarMensagem('A sessão expirou. Faça login novamente.', 'error')
  }
}

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault()
  loginButton.disabled = true
  mostrarMensagem('A validar credenciais...')
  try {
    const response = await fetch('/logadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ admin: formLogin.admin.value.trim(), senha: formLogin.senha.value })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.erro || 'Não foi possível iniciar sessão.')
    guardarToken(result.token)
    formLogin.senha.value = ''
    await carregarSessao()
    mostrarMensagem('Login efetuado. Use os formulários abaixo para gerir os dados.', 'success')
  } catch (error) {
    limparSessao()
    mostrarMensagem(error.message, 'error')
  } finally {
    loginButton.disabled = false
  }
})

logoutButton.addEventListener('click', () => {
  limparSessao()
  mostrarMensagem('Sessão encerrada.', 'success')
})

document.querySelectorAll('.cancel-edit').forEach((button) => {
  button.addEventListener('click', () => {
    const form = button.closest('form')
    form.reset()
    form.elements.id.value = ''
  })
})

document.querySelector('#limpar-relacao').addEventListener('click', limparFormularioRelacao)

document.querySelector('#form-fabricantes').addEventListener('submit', (event) => {
  event.preventDefault()
  salvarRecurso({ form: event.currentTarget, path: '/fabricantes', preparar: (dados, form) => ({ nome: dados.nome, ativo: booleano(form, 'ativo') }) }).catch((error) => mostrarMensagem(error.message, 'error'))
})

document.querySelector('#form-veiculos').addEventListener('submit', (event) => {
  event.preventDefault()
  salvarRecurso({ form: event.currentTarget, path: '/veiculos', preparar: (dados, form) => ({ fabricante_id: Number(dados.fabricante_id), nome: dados.nome, ano_inicio: inteiroOuNulo(dados.ano_inicio), ano_fim: inteiroOuNulo(dados.ano_fim), ativo: booleano(form, 'ativo') }) }).catch((error) => mostrarMensagem(error.message, 'error'))
})

document.querySelector('#form-problemas').addEventListener('submit', (event) => {
  event.preventDefault()
  salvarRecurso({ form: event.currentTarget, path: '/problemas', preparar: (dados, form) => ({ nome: dados.nome, descricao: dados.descricao || null, nivel_urgencia: Number(dados.nivel_urgencia), ativo: booleano(form, 'ativo') }) }).catch((error) => mostrarMensagem(error.message, 'error'))
})

document.querySelector('#form-causas').addEventListener('submit', (event) => {
  event.preventDefault()
  salvarRecurso({ form: event.currentTarget, path: '/causas', preparar: (dados, form) => ({ nome: dados.nome, resumo: dados.resumo, recomendacao: dados.recomendacao, nivel_gravidade: Number(dados.nivel_gravidade), ativo: booleano(form, 'ativo') }) }).catch((error) => mostrarMensagem(error.message, 'error'))
})

document.querySelector('#form-relacoes').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget
  const problemaId = Number(form.problema_id.value)
  const causaId = Number(form.causa_possivel_id.value)
  const problemaOriginal = Number(form.elements.relacao_problema_id.value)
  const causaOriginal = Number(form.elements.relacao_causa_possivel_id.value)
  const editando = Number.isInteger(problemaOriginal) && problemaOriginal > 0 && Number.isInteger(causaOriginal) && causaOriginal > 0
  try {
    if (editando) {
      await apiAdmin(`/prob_causa/${problemaOriginal}/${causaOriginal}`, jsonOptions('PUT', { ordem_exibicao: Number(form.ordem_exibicao.value) }))
    } else {
      await apiAdmin('/prob_causa', jsonOptions('POST', { problema_id: problemaId, causa_possivel_id: causaId, ordem_exibicao: Number(form.ordem_exibicao.value) }))
    }
    limparFormularioRelacao()
    await carregarDados()
    mostrarMensagem(editando ? 'Relação atualizada com sucesso.' : 'Relação criada com sucesso.', 'success')
  } catch (error) {
    mostrarMensagem(error.message, 'error')
  }
})

carregarSessao()
