
// =====================================================
// GERENCIAR USUÁRIOS (SOMENTE ADMINISTRADOR)
// usa ehAdministrador() e somenteNumeros() do permissoes.js
// =====================================================

function criarLinha(rotulo, valor) {

    const p = document.createElement("p");
    p.className = "info-usuario";

    const forte = document.createElement("strong");
    forte.textContent = rotulo + " ";

    p.appendChild(forte);
    p.appendChild(document.createTextNode(valor || "-"));

    return p;
}

function carregarUsuarios() {

    const area = document.getElementById("dadosUsuarios");
    const mensagem = document.getElementById("mensagemUsuarios");

    if (!area || !mensagem) return;

    const cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    area.innerHTML = "";
    mensagem.textContent = "";

    if (cadastros.length === 0) {
        mensagem.textContent = "Nenhum usuário cadastrado.";
        return;
    }

    cadastros.forEach(usuario => {

        const admin = ehAdministrador(usuario);

        const coluna = document.createElement("div");
        coluna.className = "col-12 col-md-6 col-lg-4";

        const card = document.createElement("div");
        card.className = "card-usuario";

        const nome = document.createElement("h2");
        nome.className = "nome-usuario";
        nome.textContent = usuario.nome + (admin ? " (administrador)" : "");

        card.appendChild(nome);
        card.appendChild(criarLinha("CPF:", usuario.cpf));
        card.appendChild(criarLinha("CEP:", usuario.cep));
        card.appendChild(criarLinha("Endereço:", usuario.endereco));
        card.appendChild(criarLinha("Bairro:", usuario.bairro));
        card.appendChild(criarLinha("Número:", usuario.numero));
        card.appendChild(criarLinha("Telefone:", usuario.telefone));

        const botoes = document.createElement("div");
        botoes.className = "d-flex gap-2 mt-3";

        const editar = document.createElement("a");
        editar.className = "btn btn-warning flex-fill";
        editar.href = "perfil.html?id=" + encodeURIComponent(usuario.id);
        editar.textContent = "Editar";
        botoes.appendChild(editar);

        // O administrador não pode se excluir (senão ninguém mais consegue gerenciar o sistema)
        if (!admin) {

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "btn btn-danger flex-fill";
            excluir.textContent = "Excluir";
            excluir.addEventListener("click", function () {
                excluirUsuario(usuario.id, usuario.nome);
            });
            botoes.appendChild(excluir);
        }

        card.appendChild(botoes);
        coluna.appendChild(card);
        area.appendChild(coluna);

    });

}

function excluirUsuario(id, nome) {

    if (!confirm("Deseja realmente excluir o usuário " + nome + "?")) return;

    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    cadastros = cadastros.filter(item => String(item.id) !== String(id));

    localStorage.setItem("cadastros", JSON.stringify(cadastros));

    // remove o carrinho dele (o histórico de vendas é mantido de propósito)
    localStorage.removeItem("carrinho_" + id);

    carregarUsuarios();

    alert("Usuário excluído com sucesso!");

}

document.addEventListener("DOMContentLoaded", carregarUsuarios);
