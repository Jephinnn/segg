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
        dadosColaboradores.set(colaborador, {
            nome: colaborador,
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
                borderColor: '#1e1e1e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff' }
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
                borderColor: '#1e1e1e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff' }
                }
            }
        }
    });
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
                <td>${colaborador.ultimaNotificacao ? colaborador.ultimaNotificacao.toLocaleString() : '-'}</td>
            `;
            tbody.appendChild(row);
        });
} 