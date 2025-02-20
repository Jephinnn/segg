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
});

async function carregarDadosIniciais() {
    try {
        const notificacoes = await fetchNotificacoes();
        atualizarEstatisticas(notificacoes);
        exibirNotificacoesRecentes(notificacoes);
        atualizarGraficos(notificacoes);

        // Carrega os colaboradores
        const colaboradores = await fetchColaboradores();
        preencherColaboradores(colaboradores);

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

function atualizarEstatisticas(notificacoes) {
    const totalNotificacoes = notificacoes.length;
    const notificacoesEPI = notificacoes.filter(n => n.mensagem).length;
    const notificacoesAtividades = notificacoes.filter(n => n.mensagem2).length;
    const taxaConformidade = Math.round((1 - (totalNotificacoes / 100)) * 100);

    document.getElementById('totalNotificacoes').textContent = totalNotificacoes;
    document.getElementById('totalEPI').textContent = notificacoesEPI;
    document.getElementById('totalAtividades').textContent = notificacoesAtividades;
    document.getElementById('taxaConformidade').textContent = `${taxaConformidade}%`;
}

// Adicione esta função para formatar as datas
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Atualize a função inicializarGraficos
function inicializarGraficos() {
    const ctx = document.getElementById('notificacoesChart').getContext('2d');
    
    // Configuração do tema escuro para o Chart.js
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = '#333333';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES,
            datasets: [{
                label: 'EPIs',
                data: Array(12).fill(0),
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Atividades',
                data: Array(12).fill(0),
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
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e1e1e',
                    borderColor: '#333333',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#333333'
                    }
                },
                y: {
                    grid: {
                        color: '#333333'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Atualize a função atualizarGraficos
function atualizarGraficos(notificacoes, periodo = {}) {
    const dadosPorMes = Array(12).fill(0).map(() => ({ epi: 0, atividades: 0 }));
    
    const dataInicial = periodo.inicio ? new Date(periodo.inicio) : new Date(new Date().getFullYear(), 0, 1);
    const dataFinal = periodo.fim ? new Date(periodo.fim) : new Date(new Date().getFullYear(), 11, 31);

    notificacoes.forEach(notif => {
        const data = new Date(notif.dataHora);
        if (data >= dataInicial && data <= dataFinal) {
            const mes = data.getMonth();
            if (notif.mensagem) dadosPorMes[mes].epi++;
            if (notif.mensagem2) dadosPorMes[mes].atividades++;
        }
    });

    const chart = Chart.getChart('notificacoesChart');
    if (chart) {
        chart.data.datasets[0].data = dadosPorMes.map(d => d.epi);
        chart.data.datasets[1].data = dadosPorMes.map(d => d.atividades);
        chart.update();
    }
}

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
        
        // Determina qual mensagem mostrar (EPI ou Atividade)
        const mensagem = notif.mensagem || notif.mensagem2;
        const tipoNotificacao = notif.mensagem ? 'EPI' : 'Atividade';
        
        div.innerHTML = `
            <p><strong>${notif.colaborador}</strong></p>
            <p>Falha de ${tipoNotificacao}: ${mensagem}</p>
            <small>${formatarData(notif.dataHora)}</small>
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
            <td>${new Date(notificacao.dataHora).toLocaleString()}</td>
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