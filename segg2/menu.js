document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const mainContent = document.querySelector('.main-content');
    
    // Atualiza o nome e tipo do usuário
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    
    if (userName && userNameDisplay && userRoleDisplay) {
        userNameDisplay.textContent = userName;
        userRoleDisplay.textContent = userType === 'administrador' ? 'Administrador' : 'Visualizador';
    }

    // Toggle do menu
    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // Atualiza o ícone do botão
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
            }
        });
    }

    // Marca o item ativo do menu
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeItem = document.querySelector(`a[href="${currentPage}"]`);
    if (activeItem) {
        activeItem.parentElement.classList.add('active');
    }
}); 