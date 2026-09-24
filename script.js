    /* =====================================================
       DADOS TEMPORÁRIOS DO TEMPLATE

       Substitua este objeto futuramente por dados vindos da sua API.
       O HTML e o CSS podem continuar iguais quando o banco for conectado.
       ===================================================== */
    const dados = {
      volkswagen: {
        nome: "Volkswagen",
        modelos: {
          fusca: {
            nome: "Fusca",
            problemas: {
              fumaca: {
                nome: "Fumaça",
                causas: [
                  {
                    nome: "Possível superaquecimento do motor",
                    descricao: "A temperatura do motor pode estar acima do limite normal de operação.",
                    gravidade: "Gravidade potencial: alta"
                  },
                  {
                    nome: "Possível falha no sistema de arrefecimento",
                    descricao: "Radiador, mangueiras ou bomba d’água podem apresentar falha.",
                    gravidade: "Gravidade potencial: alta"
                  },
                  {
                    nome: "Possível vazamento de óleo",
                    descricao: "O óleo pode atingir partes quentes do motor e produzir fumaça.",
                    gravidade: "Gravidade potencial: moderada"
                  }
                ]
              },
              som: {
                nome: "Som estranho",
                causas: [
                  {
                    nome: "Possível desgaste de algum componente móvel",
                    descricao: "Um ruído incomum pode estar relacionado a desgaste ou folga.",
                    gravidade: "Gravidade potencial: moderada"
                  }
                ]
              }
            }
          }
        }
      },
      ford: {
        nome: "Ford",
        modelos: {
          fiesta: {
            nome: "Fiesta",
            problemas: {
              freios: {
                nome: "Falha nos freios",
                causas: [
                  {
                    nome: "Possível desgaste das pastilhas",
                    descricao: "As pastilhas podem estar próximas do limite de uso.",
                    gravidade: "Gravidade potencial: alta"
                  }
                ]
              }
            }
          }
        }
      },
      toyota: {
        nome: "Toyota",
        modelos: {
          corolla: {
            nome: "Corolla",
            problemas: {
              partida: {
                nome: "Dificuldade para dar partida",
                causas: [
                  {
                    nome: "Possível bateria descarregada",
                    descricao: "A bateria pode não estar fornecendo energia suficiente.",
                    gravidade: "Gravidade potencial: moderada"
                  }
                ]
              }
            }
          }
        }
      }
    };

    const fabricante = document.querySelector("#fabricante");
    const modelo = document.querySelector("#modelo");
    const problema = document.querySelector("#problema");
    const botaoConsultar = document.querySelector("#botao-consultar");
    const resultados = document.querySelector("#resultados");
    const listaCausas = document.querySelector("#lista-causas");
    const resumoSelecao = document.querySelector("#resumo-selecao");
    const indicadorEtapa = document.querySelector("#indicador-etapa");

    function preencherSelect(select, opcoes, textoInicial) {
      select.innerHTML = `<option value="">${textoInicial}</option>`;

      Object.entries(opcoes).forEach(([valor, item]) => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = item.nome;
        select.appendChild(option);
      });

      select.disabled = Object.keys(opcoes).length === 0;
    }

    function limparSelect(select, textoInicial) {
      select.innerHTML = `<option value="">${textoInicial}</option>`;
      select.disabled = true;
    }

    function atualizarEtapa(etapa) {
      indicadorEtapa.textContent = `Etapa ${etapa} de 3`;
    }

    fabricante.addEventListener("change", () => {
      limparSelect(modelo, "Selecione o modelo");
      limparSelect(problema, "Selecione primeiro o modelo");
      botaoConsultar.disabled = true;
      resultados.hidden = true;

      const fabricanteSelecionado = dados[fabricante.value];
      if (!fabricanteSelecionado) {
        atualizarEtapa(1);
        return;
      }

      preencherSelect(modelo, fabricanteSelecionado.modelos, "Selecione o modelo");
      atualizarEtapa(2);
    });

    modelo.addEventListener("change", () => {
      limparSelect(problema, "Selecione o problema");
      botaoConsultar.disabled = true;
      resultados.hidden = true;

      const fabricanteSelecionado = dados[fabricante.value];
      const modeloSelecionado = fabricanteSelecionado?.modelos[modelo.value];

      if (!modeloSelecionado) {
        atualizarEtapa(2);
        return;
      }

      preencherSelect(problema, modeloSelecionado.problemas, "Selecione o problema");
      atualizarEtapa(3);
    });

    problema.addEventListener("change", () => {
      botaoConsultar.disabled = !problema.value;
      resultados.hidden = true;
    });

    botaoConsultar.addEventListener("click", () => {
      const fabricanteSelecionado = dados[fabricante.value];
      const modeloSelecionado = fabricanteSelecionado.modelos[modelo.value];
      const problemaSelecionado = modeloSelecionado.problemas[problema.value];

      resumoSelecao.textContent = `${fabricanteSelecionado.nome} · ${modeloSelecionado.nome} · ${problemaSelecionado.nome}`;

      listaCausas.innerHTML = problemaSelecionado.causas.map((causa) => `
        <article class="cartao-causa">
          <h3>${causa.nome}</h3>
          <p>${causa.descricao}</p>
          <div class="gravidade">${causa.gravidade}</div>
        </article>
      `).join("");

      resultados.hidden = false;
      resultados.scrollIntoView({ behavior: "smooth", block: "start" });
    });
