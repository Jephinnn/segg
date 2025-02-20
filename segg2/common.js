// Configuração do endereço da API
const API_BASE_URL = "https://apiseg.vercel.app";

// Funções comuns de fetch
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

// Funções utilitárias comuns
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 