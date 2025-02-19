// Configuração do endereço da API
const API_BASE_URL = "https://apiseg.vercel.app";

document.addEventListener('DOMContentLoaded', function () {
    carregarDadosIniciais();
});

async function carregarDadosIniciais() {
    try {
        // Carrega as notificações
        const notificacoes = await fetchNotificacoes();
        exibirNotificacoes(notificacoes);

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
        console.error('Erro ao carregar dados iniciais:', error);
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
