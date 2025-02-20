// Configuração do endereço da API
const API_BASE_URL = "https://apiseg.vercel.app";

document.addEventListener('DOMContentLoaded', function () {
    carregarDadosIniciais();
});

async function carregarDadosIniciais() {
    try {
        const notificacoes = await fetchNotificacoes();
        const colaboradores = await fetchColaboradores();
        const itensErro = await fetchItensErro();
        const itensAtividades = await fetchItensAtividades();

        preencherColaboradores(colaboradores);
        preencherItensErro(itensErro);
        preencherItensAtividades(itensAtividades);
        exibirNotificacoes(notificacoes);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Funções de fetch mantidas do script original
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

function exibirNotificacoes(notificacoes) {
    const tbody = document.querySelector('#notificacoesTable tbody');
    tbody.innerHTML = '';

    notificacoes.forEach(notificacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${notificacao.colaborador}</td>
            <td>${notificacao.mensagem || '-'}</td>
            <td>${notificacao.mensagem2 || '-'}</td>
            <td>${notificacao.observacoes || '-'}</td>
            <td>${new Date(notificacao.dataHora).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

function getStatus(notificacao) {
    // Lógica para determinar o status da notificação
    return 'Pendente'; // Exemplo
}

function getStatusClass(notificacao) {
    // Lógica para determinar a classe CSS do status
    return 'pending'; // Exemplo
}

function filtrarNotificacoes() {
    const colaborador = document.getElementById('colaboradorInput').value;
    const itemErro = document.getElementById('itemErro').value;
    const itemAtividade = document.getElementById('itemAtividade').value;
    const dataInicial = document.getElementById('dataInicialNotif').value;
    const dataFinal = document.getElementById('dataFinalNotif').value;

    fetchNotificacoes().then(notificacoes => {
        const notificacoesFiltradas = notificacoes.filter(notificacao => {
            const data = new Date(notificacao.dataHora);
            const dataInicialObj = dataInicial ? new Date(dataInicial) : null;
            const dataFinalObj = dataFinal ? new Date(dataFinal) : null;

            return (
                (colaborador === '' || notificacao.colaborador === colaborador) &&
                (itemErro === '' || notificacao.mensagem?.includes(itemErro)) &&
                (itemAtividade === '' || notificacao.mensagem2?.includes(itemAtividade)) &&
                (!dataInicialObj || data >= dataInicialObj) &&
                (!dataFinalObj || data <= dataFinalObj)
            );
        });

        exibirNotificacoes(notificacoesFiltradas);
    });
}

// Funções auxiliares mantidas do script original
function preencherColaboradores(colaboradores) {
    const datalist = document.getElementById('colaboradorList');
    datalist.innerHTML = '';

    colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador;
        datalist.appendChild(option);
    });
}

function preencherItensErro(itensErro) {
    const select = document.getElementById('itemErro');
    select.innerHTML = '<option value="">Todos</option>';

    itensErro.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function preencherItensAtividades(itensAtividades) {
    const select = document.getElementById('itemAtividade');
    select.innerHTML = '<option value="">Todos</option>';

    itensAtividades.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
} 