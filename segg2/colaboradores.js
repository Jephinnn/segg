const API_BASE_URL = "https://apiseg.vercel.app";

document.addEventListener('DOMContentLoaded', function () {
    carregarDadosColaboradores();
});

async function carregarDadosColaboradores() {
    try {
        const [notificacoes, colaboradores] = await Promise.all([
            fetchNotificacoes(),
            fetchColaboradores()
        ]);

        const dadosProcessados = processarDados(notificacoes, colaboradores);
        atualizarEstatisticas(dadosProcessados);
        inicializarGraficos(dadosProcessados);
        exibirTabelaColaboradores(dadosProcessados);
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

function processarDados(notificacoes, colaboradores) {
    const dadosColaboradores = new Map();
    
    // Inicializa dados para todos os colaboradores
    colaboradores.forEach(colaborador => {
        // Agora colaborador é um objeto com {nome, equipe}
        dadosColaboradores.set(colaborador.nome, {
            nome: colaborador.nome,
            equipe: colaborador.equipe,
            totalNotificacoes: 0,
            falhasEPI: 0,
            falhasAtividade: 0,
            ultimaNotificacao: null
        });
    });

    // Processa notificações
    notificacoes.forEach(notif => {
        const dados = dadosColaboradores.get(notif.colaborador);
        if (dados) {
            dados.totalNotificacoes++;
            if (notif.mensagem) dados.falhasEPI++;
            if (notif.mensagem2) dados.falhasAtividade++;
            
            const dataNotif = new Date(notif.dataHora);
            if (!dados.ultimaNotificacao || dataNotif > dados.ultimaNotificacao) {
                dados.ultimaNotificacao = dataNotif;
            }
        }
    });

    return {
        colaboradoresMap: dadosColaboradores,
        totalColaboradores: colaboradores.length,
        colaboradoresComNotificacoes: Array.from(dadosColaboradores.values()).filter(d => d.totalNotificacoes > 0).length,
        totalNotificacoes: notificacoes.length,
        totalFalhasEPI: notificacoes.filter(n => n.mensagem).length,
        totalFalhasAtividade: notificacoes.filter(n => n.mensagem2).length
    };
}

function atualizarEstatisticas(dados) {
    document.getElementById('totalColaboradores').textContent = dados.totalColaboradores;
    document.getElementById('colaboradoresComNotificacoes').textContent = dados.colaboradoresComNotificacoes;
    document.getElementById('mediaNotificacoes').textContent = 
        (dados.totalNotificacoes / dados.totalColaboradores).toFixed(1);
}

function inicializarGraficos(dados) {
    // Configuração das cores baseada no tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDarkTheme ? '#ffffff' : '#333333';
    const gridColor = isDarkTheme ? '#333333' : '#e0e0e0';
    
    // Configuração do tema para o Chart.js
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Gráfico de distribuição (Donut)
    const ctxDistribuicao = document.getElementById('distribuicaoChart').getContext('2d');
    new Chart(ctxDistribuicao, {
        type: 'doughnut',
        data: {
            labels: ['Com Notificações', 'Sem Notificações'],
            datasets: [{
                data: [
                    dados.colaboradoresComNotificacoes,
                    dados.totalColaboradores - dados.colaboradoresComNotificacoes
                ],
                backgroundColor: ['#ff6384', '#36a2eb'],
                borderColor: isDarkTheme ? '#1e1e1e' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
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
            }
        }
    });

    // Gráfico de tipos de notificações (Donut)
    const ctxTipos = document.getElementById('tiposNotificacoesChart').getContext('2d');
    new Chart(ctxTipos, {
        type: 'doughnut',
        data: {
            labels: ['Falhas de EPI', 'Falhas de Atividade'],
            datasets: [{
                data: [dados.totalFalhasEPI, dados.totalFalhasAtividade],
                backgroundColor: ['#2196f3', '#00e676'],
                borderColor: isDarkTheme ? '#1e1e1e' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
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
            }
        }
    });
}

// Adicione um listener para atualizar os gráficos quando o tema mudar
document.addEventListener('themeChanged', function() {
    // Destrói os gráficos existentes
    const charts = ['distribuicaoChart', 'tiposNotificacoesChart'];
    charts.forEach(chartId => {
        const chartInstance = Chart.getChart(chartId);
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
    
    // Recarrega os dados e reinicializa os gráficos
    carregarDadosIniciais();
});

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

function exibirTabelaColaboradores(dados) {
    const tbody = document.querySelector('#colaboradoresTable tbody');
    tbody.innerHTML = '';

    Array.from(dados.colaboradoresMap.values())
        .sort((a, b) => b.totalNotificacoes - a.totalNotificacoes)
        .forEach(colaborador => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${colaborador.nome}</td>
                <td>${colaborador.totalNotificacoes}</td>
                <td>${colaborador.falhasEPI}</td>
                <td>${colaborador.falhasAtividade}</td>
                <td>${colaborador.ultimaNotificacao ? formatarDataLocal(colaborador.ultimaNotificacao) : '-'}</td>
            `;
            tbody.appendChild(row);
        });
} 