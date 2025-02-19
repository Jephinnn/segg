const API_URL = 'https://apiseg.vercel.app'; // URL da API

document.addEventListener('DOMContentLoaded', async function () {
    await carregarColaboradores();
    await carregarItensErro();
    await carregarItensAtividades();
    await carregarNotificacoes();
});

// Lista para armazenar os colaboradores
let listaColaboradores = [];

// Carregar os colaboradores na lista suspensa
async function carregarColaboradores() {
    try {
        const response = await fetch(`${API_URL}/get-colaboradores`);
        const data = await response.json();
        listaColaboradores = data.colaboradores;

        atualizarListaColaboradores('');
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
    }
}

// Atualiza a lista de colaboradores conforme o usuário digita
function atualizarListaColaboradores(filtro) {
    const select = document.getElementById('colaborador');
    select.innerHTML = '';

    const filtrados = listaColaboradores.filter(nome => nome.toLowerCase().includes(filtro.toLowerCase()));

    filtrados.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        select.appendChild(option);
    });

    select.style.display = filtrados.length > 0 ? 'block' : 'none';
}

// Filtrar colaboradores enquanto digita
function filtrarColaboradores() {
    const input = document.getElementById('colaboradorInput');
    atualizarListaColaboradores(input.value);
}

// Selecionar um colaborador da lista suspensa
function selecionarColaborador() {
    const select = document.getElementById('colaborador');
    const input = document.getElementById('colaboradorInput');

    if (select.selectedIndex !== -1) {
        input.value = select.value;
        select.style.display = 'none';
    }
}

// Carregar itens de erro
async function carregarItensErro() {
    try {
        const response = await fetch(`${API_URL}/get-itens-erro`);
        const data = await response.json();
        preencherSelect('itemErro', data.itens_erro);
    } catch (error) {
        console.error('Erro ao carregar itens de erro:', error);
    }
}

// Carregar itens de atividade
async function carregarItensAtividades() {
    try {
        const response = await fetch(`${API_URL}/get-itens-atividades`);
        const data = await response.json();
        preencherSelect('itemAtividade', data.itens_atividades);
    } catch (error) {
        console.error('Erro ao carregar itens de atividades:', error);
    }
}

// Preenche um `<select>` com opções
function preencherSelect(id, itens) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Todos</option>';
    itens.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// Carregar notificações na tabela
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

// Filtra os dados da tabela conforme os filtros aplicados
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
