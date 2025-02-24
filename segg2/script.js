// Configuração do endereço da API
const API_BASE_URL = "https://apiseg.vercel.app";

// Adicione no início do arquivo, após as configurações da API
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Adicione no início do arquivo, após as configurações existentes
let ultimaNotificacaoId = null;

document.addEventListener('DOMContentLoaded', function () {
    carregarDadosIniciais();
    inicializarGraficos();
    
    // Verifica novas notificações a cada 10 segundos
    verificarNovasNotificacoes(); // Primeira verificação
    setInterval(verificarNovasNotificacoes, 10000); // Verificações subsequentes

    // Exibe o nome do usuário
    const userName = localStorage.getItem('userName');
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userName && userNameDisplay) {
        userNameDisplay.textContent = userName;
    }
});

async function carregarDadosIniciais() {
    try {
        const [notificacoes, colaboradores] = await Promise.all([
            fetchNotificacoes(),
            fetchColaboradores()
        ]);
        atualizarEstatisticas(notificacoes, colaboradores);
        exibirNotificacoesRecentes(notificacoes);
        atualizarGraficos(notificacoes);

        // Carrega os itens de erro
        const itensErro = await fetchItensErro();
        preencherItensErro(itensErro);

        // Carrega os itens de atividade
        const itensAtividades = await fetchItensAtividades();
        preencherItensAtividades(itensAtividades);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function fetchNotificacoes() {
    const response = await fetch(`${API_BASE_URL}/get-notificacoes`);
    const data = await response.json();
    return data.notificacoes;
}

async function fetchColaboradores() {
    const response = await fetch(`${API_BASE_URL}/get-colaboradores`);
    const data = await response.json();
    return data.colaboradores;
}

async function fetchItensErro() {
    const response = await fetch(`${API_BASE_URL}/get-itens-erro`);
    const data = await response.json();
    return data.itens_erro;
}

async function fetchItensAtividades() {
    const response = await fetch(`${API_BASE_URL}/get-itens-atividades`);
    const data = await response.json();
    return data.itens_atividades;
}

function atualizarEstatisticas(notificacoes, colaboradores) {
    const totalNotificacoes = notificacoes.length;
    const notificacoesEPI = notificacoes.filter(n => n.mensagem).length;
    const notificacoesAtividades = notificacoes.filter(n => n.mensagem2).length;
    
    // Calcula colaboradores únicos com notificações
    const colaboradoresNotificados = new Set(notificacoes.map(n => n.colaborador)).size;
    const totalColaboradores = colaboradores.length;
    
    // Calcula a taxa de não conformidade
    const taxaNaoConformidade = (colaboradoresNotificados / totalColaboradores) * 100;

    document.getElementById('totalNotificacoes').textContent = totalNotificacoes;
    document.getElementById('totalEPI').textContent = notificacoesEPI;
    document.getElementById('totalAtividades').textContent = notificacoesAtividades;
    document.getElementById('taxaNaoConformidade').textContent = `${taxaNaoConformidade.toFixed(2)}%`;
}

// Adicione esta função para formatar as datas
function formatarDataLocal(timestamp) {
    // Extrai as partes da data do timestamp usando UTC
    const data = new Date(timestamp);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    const hora = String(data.getUTCHours()).padStart(2, '0');
    const minutos = String(data.getUTCMinutes()).padStart(2, '0');
    const segundos = String(data.getUTCSeconds()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;
}

// Função para gerar os labels baseado no período
function gerarLabels(dataInicial, dataFinal) {
    const labels = [];
    const diffDias = Math.ceil((dataFinal - dataInicial) / (1000 * 60 * 60 * 24));
    const usarDias = diffDias <= 30;

    if (usarDias) {
        // Mostra dias para períodos menores que 30 dias
        for (let data = new Date(dataInicial); data <= dataFinal; data.setDate(data.getDate() + 1)) {
            labels.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
    } else {
        // Mostra meses para períodos maiores
        const dataAtual = new Date(dataInicial);
        while (dataAtual <= dataFinal) {
            const mesAno = `${MESES[dataAtual.getMonth()].substring(0, 3)}/${dataAtual.getFullYear().toString().substring(2)}`;
            labels.push(mesAno);
            dataAtual.setMonth(dataAtual.getMonth() + 1);
        }
    }
    return { labels, usarDias };
}

// Função para inicializar dados do período
function inicializarDadosPeriodo(labels) {
    return Array(labels.length).fill(0).map(() => ({ epi: 0, atividades: 0 }));
}

// Atualize a função atualizarGraficos
function atualizarGraficos(notificacoes, periodo = {}) {
    const hoje = new Date();
    const dataFinal = periodo.fim ? new Date(periodo.fim) : hoje;
    const dataInicial = periodo.inicio ? 
        new Date(periodo.inicio) : 
        new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);

    // Ajusta as horas para comparação correta
    dataInicial.setHours(0, 0, 0, 0);
    dataFinal.setHours(23, 59, 59, 999);

    // Gera labels apropriados para o período
    const { labels, usarDias } = gerarLabels(dataInicial, dataFinal);
    const dadosPorPeriodo = inicializarDadosPeriodo(labels);

    notificacoes.forEach(notif => {
        const dataNotif = new Date(notif.dataHora);
        if (dataNotif >= dataInicial && dataNotif <= dataFinal) {
            let indice;
            
            if (usarDias) {
                // Calcula o índice baseado em dias
                indice = Math.floor((dataNotif - dataInicial) / (1000 * 60 * 60 * 24));
            } else {
                // Calcula o índice baseado em meses
                indice = (dataNotif.getFullYear() - dataInicial.getFullYear()) * 12 + 
                        (dataNotif.getMonth() - dataInicial.getMonth());
            }

            if (indice >= 0 && indice < dadosPorPeriodo.length) {
                if (notif.mensagem) dadosPorPeriodo[indice].epi++;
                if (notif.mensagem2) dadosPorPeriodo[indice].atividades++;
            }
        }
    });

    const chart = Chart.getChart('notificacoesChart');
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = dadosPorPeriodo.map(d => d.epi);
        chart.data.datasets[1].data = dadosPorPeriodo.map(d => d.atividades);
        chart.update();
    }
}

// Atualize a função inicializarGraficos
function inicializarGraficos() {
    const ctx = document.getElementById('notificacoesChart').getContext('2d');
    
    // Configuração das cores baseada no tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDarkTheme ? '#ffffff' : '#333333';
    const gridColor = isDarkTheme ? '#333333' : '#e0e0e0';
    
    // Configuração do tema para o Chart.js
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Obtém os labels iniciais (últimos 12 meses)
    const hoje = new Date();
    const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
    const { labels } = gerarLabels(dataInicial, hoje);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'EPIs',
                data: Array(labels.length).fill(0),
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Atividades',
                data: Array(labels.length).fill(0),
                borderColor: '#00e676',
                backgroundColor: 'rgba(0, 230, 118, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDarkTheme ? '#1e1e1e' : '#ffffff',
                    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
                    borderWidth: 1,
                    titleColor: textColor,
                    bodyColor: textColor,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: true
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: gridColor,
                        drawBorder: true
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Adicione um listener para atualizar o gráfico quando o tema mudar
document.addEventListener('themeChanged', function() {
    // Destrói o gráfico existente
    const chartInstance = Chart.getChart('notificacoesChart');
    if (chartInstance) {
        chartInstance.destroy();
    }
    // Reinicializa o gráfico com as novas cores
    inicializarGraficos();
});

function exibirNotificacoesRecentes(notificacoes) {
    const container = document.getElementById('recentNotifications');
    container.innerHTML = '';

    // Ordena as notificações por data, mais recentes primeiro
    const notificacoesOrdenadas = [...notificacoes].sort((a, b) => 
        new Date(b.dataHora) - new Date(a.dataHora)
    );

    // Pega apenas as 5 mais recentes
    notificacoesOrdenadas.slice(0, 5).forEach(notif => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        
        let mensagensHtml = '';
        
        // Verifica e adiciona mensagem de EPI se existir
        if (notif.mensagem) {
            mensagensHtml += `<p>Falha de EPI: ${notif.mensagem}</p>`;
        }
        
        // Verifica e adiciona mensagem de Atividade se existir
        if (notif.mensagem2) {
            mensagensHtml += `<p>Falha de Atividade: ${notif.mensagem2}</p>`;
        }
        
        div.innerHTML = `
            <p><strong>${notif.colaborador}</strong></p>
            ${mensagensHtml}
            <small>${formatarDataLocal(notif.dataHora)}</small>
        `;
        container.appendChild(div);
    });

    // Se não houver notificações, mostra uma mensagem
    if (notificacoesOrdenadas.length === 0) {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = '<p>Nenhuma notificação encontrada</p>';
        container.appendChild(div);
    }
}

function exibirNotificacoes(notificacoes) {
    const tbody = document.querySelector('#notificacoesTable tbody');
    tbody.innerHTML = ''; // Limpa o conteúdo atual

    notificacoes.forEach(notificacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notificacao.colaborador}</td>
            <td>${notificacao.mensagem}</td>
            <td>${notificacao.mensagem2}</td>
            <td>${notificacao.observacoes}</td>
            <td>${formatarDataLocal(notificacao.dataHora)}</td>
        `;
        tbody.appendChild(row);
    });
}

function preencherColaboradores(colaboradores) {
    const datalist = document.getElementById('colaboradorList');
    datalist.innerHTML = ''; // Limpa o conteúdo atual

    colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador;
        datalist.appendChild(option);
    });
}

function preencherItensAtividades(itensAtividades) {
    const select = document.getElementById('itemAtividade');
    select.innerHTML = '<option value="">Todos</option>'; // Limpa o conteúdo atual

    itensAtividades.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function preencherItensErro(itensErro) {
    const select = document.getElementById('itemErro');
    select.innerHTML = '<option value="">Todos</option>'; // Limpa o conteúdo atual

    itensErro.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function filtrarDados() {
    const colaborador = document.getElementById('colaboradorInput').value;
    const itemErro = document.getElementById('itemErro').value;
    const itemAtividade = document.getElementById('itemAtividade').value;

    fetchNotificacoes().then(notificacoes => {
        const notificacoesFiltradas = notificacoes.filter(notificacao => {
            return (
                (colaborador === '' || notificacao.colaborador === colaborador) &&
                (itemErro === '' || notificacao.mensagem.includes(itemErro)) &&
                (itemAtividade === '' || notificacao.mensagem2.includes(itemAtividade))
            );
        });

        exibirNotificacoes(notificacoesFiltradas);
    });
}

// Adicione esta função para filtrar por período
function filtrarPorPeriodo() {
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;

    if (dataInicial && dataFinal) {
        fetchNotificacoes().then(notificacoes => {
            atualizarGraficos(notificacoes, {
                inicio: dataInicial,
                fim: dataFinal
            });
        });
    }
}

// Função para verificar novas notificações
async function verificarNovasNotificacoes() {
    try {
        const notificacoes = await fetchNotificacoes();
        if (notificacoes.length > 0) {
            const ultimaNotificacao = notificacoes[0]; // Assume que as notificações vêm ordenadas por data
            
            if (ultimaNotificacaoId === null) {
                ultimaNotificacaoId = ultimaNotificacao.id;
            } else if (ultimaNotificacao.id !== ultimaNotificacaoId) {
                // Temos uma nova notificação
                mostrarToast(ultimaNotificacao);
                ultimaNotificacaoId = ultimaNotificacao.id;
                
                // Atualiza os dados do dashboard
                carregarDadosIniciais();
            }
        }
    } catch (error) {
        console.error('Erro ao verificar novas notificações:', error);
    }
}

// Função para criar e mostrar o toast
function mostrarToast(notificacao) {
    const toast = document.createElement('div');
    toast.className = 'toast new-notification';
    
    const tipoNotificacao = notificacao.mensagem ? 'EPI' : 'Atividade';
    const mensagem = notificacao.mensagem || notificacao.mensagem2;

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">Nova Notificação</div>
            <p class="toast-message">
                <strong>${notificacao.colaborador}</strong><br>
                Falha de ${tipoNotificacao}: ${mensagem}
            </p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Remove o toast após 5 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}
