document.addEventListener('DOMContentLoaded', function() {
    carregarColaboradores();
    carregarItensErro();
    carregarItensAtividades();
    carregarNotificacoes();
});

async function carregarColaboradores() {
    const response = await fetch('/get-colaboradores');
    const data = await response.json();
    const select = document.getElementById('colaborador');
    data.colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador;
        option.textContent = colaborador;
        select.appendChild(option);
    });
}

async function carregarItensErro() {
    const response = await fetch('/get-itens-erro');
    const data = await response.json();
    const select = document.getElementById('itemErro');
    data.itens_erro.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

async function carregarItensAtividades() {
    const response = await fetch('/get-itens-atividades');
    const data = await response.json();
    const select = document.getElementById('itemAtividade');
    data.itens_atividades.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

async function carregarNotificacoes() {
    const response = await fetch('/get-notificacoes');
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
}

function filtrarDados() {
    const colaborador = document.getElementById('colaborador').value;
    const itemErro = document.getElementById('itemErro').value;
    const itemAtividade = document.getElementById('itemAtividade').value;

    // Aqui você pode implementar a lógica de filtragem
    // Por exemplo, fazer uma nova requisição à API com os filtros aplicados
    // ou filtrar os dados já carregados no frontend.
    console.log('Filtrar por:', colaborador, itemErro, itemAtividade);
}