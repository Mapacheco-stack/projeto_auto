const API = '';
const $ = (id) => document.getElementById(id);
const state = { fabricantes: [], veiculos: [], problemas: [], causas: [], relacoes: [], problemaSelecionado: null };
const AUDIO_SOURCES = {
  'possível desgaste do rolamento da roda': { file: '/audio/rolamento.mp3', label: 'Referência: ronco e raspagem de rolamento', source: 'Pixabay · Metal bearing rolling and spinning · freesound_community' },
  'possível desgaste ou folga na correia de acessórios': { file: '/audio/correia.mp3', label: 'Referência: partida com chiado de correia', source: 'Pixabay · Old car starting in winter · unfa' },
  'possível folga em componentes da suspensão': { file: '/audio/suspensao.mp3', label: 'Referência: rangido e gemido da suspensão', source: 'Pixabay · Car suspension creak · nmscher' },
  'possível desgaste das pastilhas ou lonas de freio': { file: '/audio/freio.mp3', label: 'Referência: chiado de frenagem', source: 'Pixabay · Car braking · Universfield' }
};
let audioAtual = null;

const fabricanteSelect = $('fabricante');
const veiculoSelect = $('veiculo');
const problemaSelect = $('problema');
const consultarButton = $('consultar');
const feedback = $('feedback');
const problemaDropdown = document.querySelector('[data-custom-select="problema"]');
const problemaTrigger = problemaDropdown?.querySelector('.custom-select-trigger');
const problemaOptions = problemaDropdown?.querySelector('.custom-select-options');

async function apiGet(path) {
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (HTTP ${response.status}).`);
  return response.json();
}

function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function preencherSelect(select, itens, textoInicial, valor = 'id', rotulo = 'nome') {
  select.replaceChildren(new Option(textoInicial, ''));
  itens.forEach((item) => select.add(new Option(item[rotulo], item[valor])));
  if (select === problemaSelect) sincronizarDropdownProblema();
}

function sincronizarDropdownProblema() {
  if (!problemaTrigger || !problemaOptions) return;
  problemaTrigger.textContent = problemaSelect.selectedOptions[0]?.textContent || 'Selecione o sintoma';
  problemaTrigger.disabled = problemaSelect.disabled;
  problemaTrigger.setAttribute('aria-disabled', String(problemaSelect.disabled));
  problemaOptions.replaceChildren(...Array.from(problemaSelect.options).map((option) => {
    const item = document.createElement('li');
    item.className = 'custom-select-option';
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.textContent = option.textContent;
    item.setAttribute('aria-selected', String(option.value === problemaSelect.value));
    item.addEventListener('click', () => {
      problemaSelect.value = option.value;
      problemaSelect.dispatchEvent(new Event('change', { bubbles: true }));
      fecharDropdownProblema();
    });
    return item;
  }));
}

function fecharDropdownProblema() {
  if (!problemaDropdown || !problemaTrigger || !problemaOptions) return;
  problemaDropdown.classList.remove('is-open');
  problemaTrigger.setAttribute('aria-expanded', 'false');
  problemaOptions.hidden = true;
}

function alternarDropdownProblema() {
  if (!problemaDropdown || problemaTrigger.disabled) return;
  const aberto = problemaDropdown.classList.toggle('is-open');
  problemaTrigger.setAttribute('aria-expanded', String(aberto));
  problemaOptions.hidden = !aberto;
}

function atualizarEstadoConsulta() {
  consultarButton.disabled = !fabricanteSelect.value || !veiculoSelect.value || !problemaSelect.value;
}

function carregarModelos() {
  const fabricanteId = Number(fabricanteSelect.value);
  const modelos = state.veiculos.filter((item) => Number(item.fabricante_id) === fabricanteId);

  veiculoSelect.replaceChildren(new Option(
    fabricanteId ? 'Selecione o modelo do veículo' : 'Selecione o fabricante primeiro',
    ''
  ));
  modelos.forEach((item) => veiculoSelect.add(new Option(item.nome, item.id)));
  veiculoSelect.disabled = !fabricanteId || modelos.length === 0;

  if (fabricanteId && modelos.length === 0) {
    veiculoSelect.add(new Option('Nenhum modelo cadastrado', ''));
  }

  atualizarEstadoConsulta();
}

function carregarProblemas() {
  const problemas = state.problemas;
  preencherSelect(problemaSelect, problemas, problemas.length ? 'Selecione o sintoma' : 'Nenhum sintoma cadastrado');
  problemaSelect.disabled = problemas.length === 0;
  sincronizarDropdownProblema();
  atualizarEstadoConsulta();
}

function nivelTexto(nivel) {
  const numero = Number(nivel);
  if (numero >= 3) return { texto: 'Atenção Urgente', classe: 'high' };
  if (numero === 2) return { texto: 'Atenção necessária', classe: 'medium' };
  return { texto: 'Atenção moderada', classe: '' };
}

function elementoSeguro(tag, className, texto) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (texto !== undefined && texto !== null) el.textContent = texto;
  return el;
}

function audioDaCausa(causa, problema) {
  if (normalizar(problema?.nome) !== 'som estranho') return null;
  return Object.entries(AUDIO_SOURCES).find(([nome]) => normalizar(nome) === normalizar(causa.nome))?.[1] || null;
}

function formatarTempo(segundos) {
  if (!Number.isFinite(segundos)) return '0:00';
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60).toString().padStart(2, '0');
  return `${minutos}:${segundosRestantes}`;
}

function criarAudio(causa, problema) {
  const faixa = audioDaCausa(causa, problema);
  if (!faixa) return null;
  const area = elementoSeguro('div', 'audio-reference');
  const topo = elementoSeguro('div', 'audio-reference-top');
  const titulo = elementoSeguro('div', 'audio-reference-title');
  titulo.append(elementoSeguro('span', 'audio-wave', ')))'), elementoSeguro('strong', '', 'Ouvir referência sonora'));
  const audio = document.createElement('audio');
  audio.preload = 'metadata';
  audio.src = faixa.file;
  audio.volume = 0.85;
  audio.setAttribute('aria-label', `${faixa.label} para ${causa.nome}`);

  const playButton = elementoSeguro('button', 'audio-play', '▶ Ouvir');
  playButton.type = 'button';
  playButton.setAttribute('aria-label', `Reproduzir ${faixa.label}`);
  const repeatButton = elementoSeguro('button', 'audio-repeat', '↻');
  repeatButton.type = 'button';
  repeatButton.setAttribute('aria-label', 'Reiniciar faixa');
  repeatButton.title = 'Reiniciar faixa';
  const progress = document.createElement('input');
  progress.type = 'range';
  progress.className = 'audio-progress';
  progress.min = '0'; progress.max = '100'; progress.step = '0.1'; progress.value = '0';
  progress.setAttribute('aria-label', 'Posição da faixa');
  const time = elementoSeguro('span', 'audio-time', '0:00 / 0:00');
  const volumeLabel = elementoSeguro('label', 'audio-volume-label');
  const volumeIcon = elementoSeguro('span', 'audio-volume-icon');
  volumeIcon.setAttribute('aria-hidden', 'true');
  volumeIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="M16 8.5c1.1 1 1.7 2.2 1.7 3.5s-.6 2.5-1.7 3.5M18.7 5.8c1.8 1.7 2.8 3.8 2.8 6.2s-1 4.5-2.8 6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const volume = document.createElement('input');
  volume.type = 'range'; volume.className = 'audio-volume'; volume.min = '0'; volume.max = '1'; volume.step = '0.05'; volume.value = '0.85';
  volume.setAttribute('aria-label', 'Volume');
  volumeLabel.append(volumeIcon, volume);

  const progressRow = elementoSeguro('div', 'audio-progress-row');
  progressRow.append(progress, time);
  const controls = elementoSeguro('div', 'audio-controls');
  controls.append(playButton, repeatButton, volumeLabel);
  const titleRow = elementoSeguro('div', 'audio-title-row');
  titleRow.append(titulo, controls);
  topo.append(titleRow, progressRow);

  const atualizarBotao = () => {
    playButton.textContent = audio.paused ? '▶ Ouvir' : 'Ⅱ Pausar';
    playButton.setAttribute('aria-label', audio.paused ? `Reproduzir ${faixa.label}` : `Pausar ${faixa.label}`);
  };
  playButton.addEventListener('click', async () => {
    if (audio.paused) {
      if (audioAtual && audioAtual !== audio) {
        audioAtual.pause();
        audioAtual.dispatchEvent(new Event('pause'));
      }
      audioAtual = audio;
      try { await audio.play(); } catch (error) { time.textContent = 'Não foi possível reproduzir'; }
    } else {
      audio.pause();
    }
    atualizarBotao();
  });
  audio.addEventListener('play', atualizarBotao);
  audio.addEventListener('pause', atualizarBotao);
  audio.addEventListener('ended', () => { audioAtual = null; atualizarBotao(); });
  audio.addEventListener('loadedmetadata', () => { time.textContent = `0:00 / ${formatarTempo(audio.duration)}`; });
  audio.addEventListener('timeupdate', () => {
    progress.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : '0';
    time.textContent = `${formatarTempo(audio.currentTime)} / ${formatarTempo(audio.duration)}`;
  });
  progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration; });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
  repeatButton.addEventListener('click', async () => {
    if (audioAtual && audioAtual !== audio) {
      audioAtual.pause();
      audioAtual.dispatchEvent(new Event('pause'));
    }
    audio.currentTime = 0;
    audioAtual = audio;
    try {
      await audio.play();
    } catch (error) {
      time.textContent = 'Não foi possível reproduzir';
    }
    atualizarBotao();
  });
  audio.className = 'audio-engine';
  area.append(topo, audio, elementoSeguro('small', 'audio-source', faixa.source));
  return area;
}

function exibirResultado(problema) {
  const relacoes = state.relacoes
    .filter((relacao) => Number(relacao.problema_id) === Number(problema.id))
    .sort((a, b) => Number(a.ordem_exibicao ?? 0) - Number(b.ordem_exibicao ?? 0));
  const causas = relacoes.map((relacao) => state.causas.find((causa) => Number(causa.id) === Number(relacao.causa_possivel_id))).filter((causa) => causa && causa.ativo !== false);

  $('diagnosis-name').textContent = problema.nome;
  $('diagnosis-description').textContent = problema.descricao || 'Não há uma descrição adicional cadastrada para este problema.';
  $('result-subtitle').textContent = `Encontramos ${causas.length} ${causas.length === 1 ? 'possível causa relacionada' : 'possíveis causas relacionadas'} ao sintoma informado.`;
  $('causes-count').textContent = `${causas.length} ${causas.length === 1 ? 'POSSÍVEL CAUSA' : 'POSSÍVEIS CAUSAS'}`;

  const lista = $('causes-list');
  lista.replaceChildren();
  if (!causas.length) {
    lista.append(elementoSeguro('div', 'empty-causes', 'Ainda não há causas relacionadas cadastradas para este problema. Recomendamos uma avaliação profissional.'));
  }

  causas.forEach((causa) => {
    const card = elementoSeguro('article', 'cause-card');
    const topo = elementoSeguro('div', 'cause-card-top');
    const conteudo = document.createElement('div');
    conteudo.append(elementoSeguro('h4', '', causa.nome));
    conteudo.append(elementoSeguro('p', '', causa.resumo || 'Não há resumo cadastrado para esta causa.'));
    const nivel = nivelTexto(causa.nivel_gravidade);
    topo.append(conteudo, elementoSeguro('span', `severity ${nivel.classe}`, nivel.texto));
    card.append(topo);
    if (causa.recomendacao) {
      const recomendacao = elementoSeguro('div', 'recommendation');
      recomendacao.append(elementoSeguro('strong', '', 'Orientação: '), document.createTextNode(causa.recomendacao));
      card.append(recomendacao);
    }
    const audio = criarAudio(causa, problema);
    if (audio) card.append(audio);
    lista.append(card);
  });

  $('resultado').hidden = false;
  $('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function iniciar() {
  $('year').textContent = new Date().getFullYear();
  feedback.textContent = 'Carregando informações do catálogo...';
  try {
    const [fabricantes, veiculos, problemas, causas, relacoes] = await Promise.all([
      apiGet('/fabricantes'), apiGet('/veiculos'), apiGet('/problemas'), apiGet('/causas'), apiGet('/prob_causa')
    ]);
    state.fabricantes = fabricantes.filter((item) => item.ativo !== false);
    state.veiculos = veiculos.filter((item) => item.ativo !== false);
    state.problemas = problemas.filter((item) => item.ativo !== false);
    state.causas = causas;
    state.relacoes = relacoes;
    preencherSelect(fabricanteSelect, state.fabricantes, 'Selecione o fabricante');
    carregarModelos();
    carregarProblemas();
    feedback.textContent = state.problemas.length ? '' : 'Nenhum problema está cadastrado no catálogo neste momento.';
  } catch (error) {
    console.error(error);
    feedback.textContent = 'Não foi possível carregar o catálogo. Verifique se a API e o banco de dados estão disponíveis e atualize a página.';
    problemaSelect.replaceChildren(new Option('Falha ao carregar os sintomas', ''));
    problemaSelect.disabled = true;
    sincronizarDropdownProblema();
  }
}

fabricanteSelect.addEventListener('change', () => {
  veiculoSelect.value = '';
  carregarModelos();
});
veiculoSelect.addEventListener('change', atualizarEstadoConsulta);
problemaSelect.addEventListener('change', () => {
  sincronizarDropdownProblema();
  atualizarEstadoConsulta();
});
problemaTrigger?.addEventListener('click', alternarDropdownProblema);
document.addEventListener('click', (event) => {
  if (problemaDropdown && !problemaDropdown.contains(event.target)) fecharDropdownProblema();
});
consultarButton.addEventListener('click', () => {
  if (!fabricanteSelect.value || !veiculoSelect.value || !problemaSelect.value) {
    atualizarEstadoConsulta();
    feedback.textContent = 'Selecione o fabricante, o modelo do veículo e o sintoma para continuar.';
    return;
  }

  feedback.textContent = '';
  const problema = state.problemas.find((item) => Number(item.id) === Number(problemaSelect.value));
  if (problema) {
    $('step-count').textContent = 'PASSO 2 DE 2';
    exibirResultado(problema);
  }
});
$('nova-consulta').addEventListener('click', () => {
  $('resultado').hidden = true;
  $('step-count').textContent = 'PASSO 1 DE 2';
  problemaSelect.value = '';
  atualizarEstadoConsulta();
  $('consulta').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

iniciar();
