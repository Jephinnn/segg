// Verifica se há uma preferência salva
let currentTheme = localStorage.getItem('theme') || 'dark';

// Aplica o tema inicial
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons();

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcons();
    
    // Dispara um evento customizado quando o tema muda
    document.dispatchEvent(new Event('themeChanged'));
}

function updateThemeIcons() {
    // Pega todos os ícones de tema na página (pode haver múltiplos em diferentes locais)
    const lightIcons = document.querySelectorAll('#lightIcon');
    const darkIcons = document.querySelectorAll('#darkIcon');
    
    if (currentTheme === 'dark') {
        // Remove a classe active de todos os ícones de sol
        lightIcons.forEach(icon => {
            icon.classList.remove('active');
            icon.style.backgroundColor = '';
        });
        // Adiciona a classe active em todos os ícones de lua
        darkIcons.forEach(icon => {
            icon.classList.add('active');
            icon.style.backgroundColor = 'var(--primary-color)';
            icon.style.color = 'white';
        });
    } else {
        // Adiciona a classe active em todos os ícones de sol
        lightIcons.forEach(icon => {
            icon.classList.add('active');
            icon.style.backgroundColor = 'var(--primary-color)';
            icon.style.color = 'white';
        });
        // Remove a classe active de todos os ícones de lua
        darkIcons.forEach(icon => {
            icon.classList.remove('active');
            icon.style.backgroundColor = '';
        });
    }
} 