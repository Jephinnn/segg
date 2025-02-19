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
        select.innerHTML = '<option value="">Todos</option>';
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

function filtrarDados() {
    const colaborador = document.getElementById('colaborador').value;
    const itemErro = document.getElementById('itemErro').value;
    const itemAtividade = document.getElementById('itemAtividade').value;
    
    const rows = document.querySelectorAll('#notificacoesTable tbody tr');
    rows.forEach(row => {
        const colab = row.children[0].textContent;
        const mensagem = row.children[1].textContent;
        const mensagem2 = row.children[2].textContent;
        const observacoes = row.children[3].textContent;
        
        const matchColaborador = !colaborador || colab === colaborador;
        const matchItemErro = !itemErro || mensagem.includes(itemErro) || mensagem2.includes(itemErro);
        const matchItemAtividade = !itemAtividade || observacoes.includes(itemAtividade);

        if (matchColaborador && matchItemErro && matchItemAtividade) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
