document.addEventListener("DOMContentLoaded", function () {
    carregarColaboradores();
    carregarItensErro();
    carregarItensAtividade();
});

function carregarColaboradores() {
    // Simulação de nomes vindos da API (substitua por sua chamada real)
    const colaboradores = ["Ana Souza", "Bruno Lima", "Carlos Mendes", "Daniela Alves", "Eduardo Santos"];

    const datalist = document.getElementById("colaboradorList");
    datalist.innerHTML = ""; // Limpa a lista antes de preencher

    colaboradores.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        datalist.appendChild(option);
    });
}

function carregarItensErro() {
    const itensErro = ["Óculos", "Luva", "Capacete"];
    const select = document.getElementById("itemErro");
    itensErro.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function carregarItensAtividade() {
    const itensAtividade = ["Manutenção", "Inspeção", "Operação"];
    const select = document.getElementById("itemAtividade");
    itensAtividade.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function filtrarDados() {
    const colaborador = document.getElementById("colaboradorInput").value;
    const itemErro = document.getElementById("itemErro").value;
    const itemAtividade = document.getElementById("itemAtividade").value;

    console.log("Filtrando por:", colaborador, itemErro, itemAtividade);
    
    // Aqui você pode implementar a lógica de filtragem na tabela de notificações.
}
