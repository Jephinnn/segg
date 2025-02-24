// Verifica se o usuário está logado e retorna o tipo de usuário
function verificarAutenticacao() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        window.location.href = 'index.html';
        return null;
    }
    return localStorage.getItem('userType');
}

// Define os menus HTML
const MENU_ADMIN = `
    <ul>
        <li><a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
        <li><a href="notificacoes.html"><i class="fas fa-clipboard-list"></i> Notificações</a></li>
        <li><a href="colaboradores.html"><i class="fas fa-users"></i> Colaboradores</a></li>
        <li class="admin-menu">
            <a href="#"><i class="fas fa-cog"></i> Administrativo</a>
            <ul class="submenu">
                <li><a href="adicionar-colaborador.html">Adicionar Colaborador</a></li>
                <li><a href="remover-colaborador.html">Remover Colaborador</a></li>
            </ul>
        </li>
    </ul>
`;

const MENU_VISUALIZADOR = `
    <ul>
        <li><a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
        <li><a href="notificacoes.html"><i class="fas fa-clipboard-list"></i> Notificações</a></li>
        <li><a href="colaboradores.html"><i class="fas fa-users"></i> Colaboradores</a></li>
    </ul>
`;

// Renderiza o menu baseado no tipo de usuário
function renderizarMenu() {
    const userType = verificarAutenticacao();
    document.body.setAttribute('data-user-type', userType);
    
    // Redireciona se for visualizador em página administrativa
    if (userType !== 'administrador') {
        const adminPages = ['adicionar-colaborador.html', 'remover-colaborador.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        if (adminPages.includes(currentPage)) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    // Marca o item ativo do menu
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const activeItem = document.querySelector(`a[href="${currentPage}"]`);
    if (activeItem) {
        activeItem.parentElement.classList.add('active');
    }
}

// Adiciona função de logout
function logout() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

// Inicializa o menu quando a página carrega
document.addEventListener('DOMContentLoaded', renderizarMenu); 