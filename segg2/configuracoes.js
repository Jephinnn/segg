// URLs da API
const API_URL = 'https://seu-dominio-api.com'; // Substitua pela URL real da sua API

// Gerenciamento de colaboradores
let colaboradores = [];

// Carregar colaboradores da API
async function carregarColaboradores() {
    try {
        const response = await fetch(`${API_URL}/get-colaboradores`);
        if (!response.ok) throw new Error('Erro ao carregar colaboradores');
        const data = await response.json();
        if (data.success) {
            colaboradores = data.colaboradores.map((nome, index) => ({
                id: index + 1,
                nome: nome
            }));
            atualizarListaColaboradores();
        }
    } catch (error) {
        mostrarToast('Erro ao carregar colaboradores', 'error');
        console.error(error);
    }
}

async function adicionarColaborador(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    
    if (nome) {
        try {
            const response = await fetch(`${API_URL}/sync-colaboradores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([{ nome }]) // API espera um array de colaboradores
            });

            if (!response.ok) throw new Error('Erro ao adicionar colaborador');
            
            const data = await response.json();
            if (data.success) {
                await carregarColaboradores(); // Recarrega a lista atualizada
                mostrarToast('Colaborador adicionado com sucesso!', 'success');
                document.getElementById('formColaborador').reset();
            }
        } catch (error) {
            mostrarToast('Erro ao adicionar colaborador', 'error');
            console.error(error);
        }
    }
}

async function removerColaborador(id) {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
        try {
            const response = await fetch(`${API_URL}/colaboradores/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erro ao remover colaborador');

            colaboradores = colaboradores.filter(col => col.id !== id);
            atualizarListaColaboradores();
            mostrarToast('Colaborador removido com sucesso!', 'success');
        } catch (error) {
            mostrarToast('Erro ao remover colaborador', 'error');
            console.error(error);
        }
    }
}

function atualizarListaColaboradores() {
    const lista = document.getElementById('listaColaboradores');
    lista.innerHTML = '';

    if (colaboradores.length === 0) {
        lista.innerHTML = '<li class="colaborador-item">Nenhum colaborador cadastrado</li>';
        return;
    }

    colaboradores.forEach(col => {
        const li = document.createElement('li');
        li.className = 'colaborador-item';
        li.innerHTML = `
            <span class="colaborador-nome">${col.nome}</span>
            <button onclick="removerColaborador('${col.nome}')" class="btn-delete">
                <i class="fas fa-trash"></i> Remover
            </button>
        `;
        lista.appendChild(li);
    });
}

function mostrarToast(mensagem, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializar carregando dados da API
document.addEventListener('DOMContentLoaded', carregarColaboradores); 