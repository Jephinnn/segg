const API_BASE_URL = 'https://apiseg.vercel.app';

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('adicionar-colaborador.html')) {
        carregarEquipes();
    } else if (window.location.pathname.includes('remover-colaborador.html')) {
        carregarColaboradores();
        configurarBuscaColaborador();
    }

    const inputNome = document.getElementById('nome');
    if (inputNome) {
        inputNome.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase();
        });
    }
});

async function carregarEquipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-equipes`);
        const data = await response.json();
        
        const select = document.getElementById('equipe');
        select.innerHTML = '<option value="">Selecione uma equipe</option>';
        
        if (data.success) {
            data.equipes.forEach(equipe => {
                const option = document.createElement('option');
                option.value = equipe;
                option.textContent = equipe;
                select.appendChild(option);
            });
        } else {
            throw new Error(data.detail || 'Erro ao carregar equipes');
        }
    } catch (error) {
        mostrarToast('Erro ao carregar equipes', 'error');
        console.error(error);
    }
}

async function adicionarColaborador(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const equipe = document.getElementById('equipe').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/adicionar-colaborador`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, equipe })
        });

        const data = await response.json();
        if (data.success) {
            mostrarToast('Colaborador adicionado com sucesso!', 'success');
            document.getElementById('formAdicionarColaborador').reset();
        } else {
            throw new Error(data.detail || 'Erro ao adicionar colaborador');
        }
    } catch (error) {
        mostrarToast(error.message, 'error');
        console.error(error);
    }
}

async function carregarColaboradores() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-colaboradores`);
        const data = await response.json();
        if (data.success) {
            atualizarTabelaColaboradores(data.colaboradores);
        }
    } catch (error) {
        mostrarToast('Erro ao carregar colaboradores', 'error');
        console.error(error);
    }
}

function atualizarTabelaColaboradores(colaboradores) {
    const tbody = document.querySelector('#tabelaColaboradores tbody');
    tbody.innerHTML = '';

    colaboradores.forEach(col => {
        // Log para debug
        console.log('Nome do colaborador:', col.nome);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${col.nome}</td>
            <td>${col.equipe || '-'}</td>
            <td>
                <button onclick="removerColaborador('${col.nome}')" class="btn-delete">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function configurarBuscaColaborador() {
    const searchInput = document.getElementById('searchColaborador');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const response = await fetch(`${API_BASE_URL}/get-colaboradores`);
        const data = await response.json();
        
        if (data.success) {
            const colaboradoresFiltrados = data.colaboradores.filter(col => 
                col.nome.toLowerCase().includes(searchTerm)
            );
            atualizarTabelaColaboradores(colaboradoresFiltrados);
        }
    });
}

async function removerColaborador(nome) {
    if (confirm(`Tem certeza que deseja remover o colaborador "${nome}"?`)) {
        try {
            const nomeEncoded = encodeURIComponent(nome.trim());
            console.log('Nome sendo enviado:', nome);
            console.log('Nome codificado:', nomeEncoded);
            
            const response = await fetch(`${API_BASE_URL}/remover-colaborador/${nomeEncoded}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            console.log('Resposta completa:', data);

            if (!response.ok) {
                throw new Error(data.detail || 'Erro ao remover colaborador');
            }

            if (data.success) {
                mostrarToast('Colaborador removido com sucesso!', 'success');
                await carregarColaboradores();
            } else {
                throw new Error(data.detail || 'Erro ao remover colaborador');
            }
        } catch (error) {
            mostrarToast(error.message, 'error');
            console.error('Erro completo:', error);
        }
    }
}

async function buscarColaborador(nome) {
    try {
        const response = await fetch(`${API_BASE_URL}/buscar-colaborador/${encodeURIComponent(nome)}`);
        const data = await response.json();
        return data.success ? data.colaborador : null;
    } catch (error) {
        console.error('Erro ao buscar colaborador:', error);
        return null;
    }
}

function mostrarToast(mensagem, tipo) {
    // Garante que o container existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Cria o toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Adiciona o conteúdo do toast
    toast.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">×</button>
    `;
    
    container.appendChild(toast);

    // Remove o toast após 3 segundos com animação
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
} 