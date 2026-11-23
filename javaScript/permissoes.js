// CPF DO ÚNICO ADMINISTRADOR
const CPF_ADMINISTRADOR = "12287734910";

function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function ehAdministrador(usuario) {
    return !!usuario && somenteNumeros(usuario.cpf) === CPF_ADMINISTRADOR;
}

function verificarPermissoes() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    const administrador = ehAdministrador(usuario);

    usuario.tipoUsuario = administrador ? "administrador" : "cliente";

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // MENUS SOMENTE DO ADMINISTRADOR
    const menusAdmin = [
        "menuListaProdutos",
        "menuCadastrarProduto",
        "menuCadastros",
        "botaoCadastrarProduto"
    ];

    menusAdmin.forEach(function (id) {

        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.style.display = administrador ? "" : "none";
        }

    });

    // HISTÓRICO: admin vê tudo, cliente vê só as compras dele
    const linkVendas = document.querySelector("#menuVendas a");

    if (linkVendas) {
        linkVendas.textContent = administrador ? "Histórico de Vendas" : "Minhas Compras";
    }

    // LINK "MEU PERFIL" (todos os usuários), inserido antes do "Sair"
    const menu = document.querySelector("#menuNavbar .navbar-nav");

    if (menu && !document.getElementById("menuPerfil")) {

        const li = document.createElement("li");
        li.className = "nav-item";
        li.id = "menuPerfil";

        const a = document.createElement("a");
        a.className = "nav-link";
        a.href = "perfil.html";
        a.textContent = "👤 Meu Perfil";

        if (window.location.pathname.endsWith("perfil.html")) {
            a.classList.add("active");
        }

        li.appendChild(a);
        menu.insertBefore(li, menu.lastElementChild);
    }

    // PROTEÇÃO DAS PÁGINAS ADMINISTRATIVAS
    const paginaAdmin = document.body.dataset.adminOnly === "true";

    if (paginaAdmin && !administrador) {

        alert("Acesso permitido somente ao administrador.");

        window.location.href = "home.html";
        return;
    }

}

function sair() {

    localStorage.removeItem("usuarioLogado");

    window.location.href = "login.html";

}

document.addEventListener("DOMContentLoaded", verificarPermissoes);