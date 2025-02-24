const API_BASE_URL = 'https://apiseg.vercel.app';

async function realizarLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch(`${API_BASE_URL}/verificar-login/${usuario}/${senha}`);
        const data = await response.json();

        if (data.success) {
            // Salva os dados do usuário no localStorage
            localStorage.setItem('userName', data.usuario);
            localStorage.setItem('userType', data.tipo);

            // Redireciona para a página principal
            window.location.href = 'dashboard.html';
        } else {
            mostrarToast('Usuário ou senha incorretos', 'error');
        }
    } catch (error) {
        console.error('Erro completo:', error);
        mostrarToast('Erro ao realizar login', 'error');
    }
}

function mostrarToast(mensagem, tipo) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
} 