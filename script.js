const API_URL = 'https://apiseg.vercel.app'; // Substitua pelo endereço da sua API

document.addEventListener('DOMContentLoaded', function() {
    carregarColaboradores();
    carregarItensErro();
    carregarItensAtividades();
    carregarNotificacoes();
});

async function carregarColaboradores() {
    try {
        const response = await fetch(`${API_URL}/get-colaboradores`);
        const data = await response.json();
        const select = document.getElementById('colaborador');
        select.innerHTML = '<option value="">Todos</option>'; // Limpa as opções
        data.colaboradores.forEach(colaborador => {
            const option = document.createElement('option');
            option.value = colaborador;
            option.textContent = colaborador;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
    }
}

async function carregarItensErro() {
    try {
        const response = await fetch(`${API_URL}/get-itens-erro`);
        const data = await response.json();
        const select = document.getElementById('itemErro');
        select.innerHTML = '<option value="">Todos</option>';
        data.itens_erro.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar itens de erro:', error);
    }
}

async function carregarItensAtividades() {
    try {
        const response = await fetch(`${API_URL}/get-itens-atividades`);
        const data = await response.json();
        const select = document.getElementById('itemAtividade');
        select.innerHTML = '<option value="">Todos</option>';
        data.itens_atividades.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar itens de atividades:', error);
    }
}

async function carregarNotificacoes() {
    try {
        const response = await fetch(`${API_URL}/get-notificacoes`);
        const data = await response.json();
        const tbody = document.querySelector('#notificacoesTable tbody');
        tbody.innerHTML = '';
        data.notificacoes.forEach(notificacao => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${notificacao.notificacao_id}</td>
                <td>${notificacao.colaborador}</td>
                <td>${notificacao.mensagem}</td>
                <td>${notificacao.observacoes}</td>
                <td>${new Date(notificacao.dataHora).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

function filtrarDados() {
    const colaborador = document.getElementById('colaborador').value;
    const itemErro = document.getElementById('itemErro').value;
    const itemAtividade = document.getElementById('itemAtividade').value;

    // Implemente a lógica de filtragem aqui
    console.log('Filtrar por:', colaborador, itemErro, itemAtividade);
}
