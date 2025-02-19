const API_URL = 'https://apiseg.vercel.app'; // Substitua pelo endereço da sua API

document.addEventListener('DOMContentLoaded', async function () {
    await carregarColaboradores();
    await carregarItensErro();
    await carregarItensAtividades();
    await carregarNotificacoes();
});

// Função para carregar os colaboradores e preencher o datalist
async function carregarColaboradores() {
    try {
        const response = await fetch(`${API_URL}/get-colaboradores`);
        const data = await response.json();
        const datalist = document.getElementById('colaboradorList');
        datalist.innerHTML = ''; // Limpa o datalist antes de preencher

        data.colaboradores.forEach(colaborador => {
            const option = document.createElement('option');
            option.value = colaborador;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
    }
}

// Função para carregar itens de erro
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

// Função para carregar itens de atividade
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

// Função para carregar notificações
async function carregarNotificacoes() {
    try {
        const response = await fetch(`${API_URL}/get-notificacoes`);
        const data = await response.json();
        const tbody = document.querySelector('#notificacoesTable tbody');
        tbody.innerHTML = '';

        data.notificacoes.forEach(notificacao => {
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
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

// Função para filtrar os dados da tabela
function filtrarDados() {
    const colaborador = document.getElementById('colaboradorInput').value.toLowerCase();
    const itemErro = document.getElementById('itemErro').value.toLowerCase();
    const itemAtividade = document.getElementById('itemAtividade').value.toLowerCase();
    
    const rows = document.querySelectorAll('#notificacoesTable tbody tr');
    rows.forEach(row => {
        const colab = row.children[0].textContent.toLowerCase();
        const mensagem = row.children[1].textContent.toLowerCase();
        const mensagem2 = row.children[2].textContent.toLowerCase();
        const observacoes = row.children[3].textContent.toLowerCase();

        const matchColaborador = !colaborador || colab.includes(colaborador);
        const matchItemErro = !itemErro || mensagem.includes(itemErro) || mensagem2.includes(itemErro);
        const matchItemAtividade = !itemAtividade || observacoes.includes(itemAtividade);

        row.style.display = (matchColaborador && matchItemErro && matchItemAtividade) ? '' : 'none';
    });
}
