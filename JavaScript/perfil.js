// =====================================================
// MEU PERFIL
// - cliente: vê e altera os próprios dados
// - administrador: também pode abrir o perfil de outro usuário
//   (perfil.html?id=123, vindo de "Gerenciar Usuários")
// usa ehAdministrador() e somenteNumeros() do permissoes.js
// e buscarEndereco() do apicep.js
// =====================================================

// Nomes de id aceitos para cada campo. Se o id não existir na página,
// o código usa a ordem dos campos (nome, cpf, cep, endereço, bairro,
// número, telefone, senha atual, nova senha, confirmar senha).
const PERFIL_IDS = {
    nome: ["nome"],
    cpf: ["cpf"],
    cep: ["cep"],
    endereco: ["endereco"],
    bairro: ["bairro"],
    numero: ["numero", "complemento"],
    telefone: ["telefone"],
    senhaAtual: ["senhaAtual", "senhaAntiga", "senha_atual", "senhaatual"],
    novaSenha: ["novaSenha", "senhaNova", "nova_senha", "novasenha"],
    confirmarSenha: ["confirmarSenha", "confirmaSenha", "confirmarNovaSenha", "confirmar_senha"]
};

const PERFIL_ORDEM = [
    "nome", "cpf", "cep", "endereco", "bairro",
    "numero", "telefone", "senhaAtual", "novaSenha", "confirmarSenha"
];

let perfilCampos = {};
let perfilCadastroId = null;
let perfilEditandoOutro = false;
let perfilUltimoSalvar = 0;


// -----------------------------------------------------
// ENCONTRAR OS CAMPOS DA PÁGINA
// -----------------------------------------------------

function localizarCampos() {

    const tiposIgnorados = ["hidden", "file", "checkbox", "radio", "button", "submit"];

    const todos = Array.from(document.querySelectorAll("input"))
        .filter(campo => !tiposIgnorados.includes(campo.type));

    const campos = {};

    PERFIL_ORDEM.forEach(function (nome, indice) {

        let elemento = null;

        for (const id of PERFIL_IDS[nome]) {

            elemento = document.getElementById(id);

            if (elemento) break;

        }

        campos[nome] = elemento || todos[indice] || null;

    });

    return campos;

}


function formatarCpfPerfil(cpf) {

    const n = somenteNumeros(cpf);

    if (n.length !== 11) return cpf || "";

    return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);

}


// -----------------------------------------------------
// QUEM ESTÁ SENDO EDITADO
// -----------------------------------------------------

function descobrirCadastroAlvo() {

    const logado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!logado) return null;

    const idUrl = new URLSearchParams(window.location.search).get("id");

    // só o administrador pode abrir o perfil de outra pessoa
    if (ehAdministrador(logado) && idUrl && String(idUrl) !== String(logado.id)) {

        perfilEditandoOutro = true;

        return idUrl;

    }

    perfilEditandoOutro = false;

    return logado.id;

}


// -----------------------------------------------------
// CARREGAR OS DADOS NA TELA
// -----------------------------------------------------

function carregarPerfil() {

    perfilCampos = localizarCampos();

    const idAlvo = descobrirCadastroAlvo();

    if (idAlvo === null) return;

    perfilCadastroId = idAlvo;

    const cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    const cadastro = cadastros.find(item => String(item.id) === String(idAlvo));

    if (!cadastro) {

        alert("Não encontrei seu cadastro. Faça login novamente.");

        window.location.href = "login.html";

        return;

    }

    const c = perfilCampos;

    if (c.nome) c.nome.value = cadastro.nome || "";

    if (c.cpf) {

        c.cpf.value = formatarCpfPerfil(cadastro.cpf);

        c.cpf.readOnly = true;

    }

    if (c.cep) c.cep.value = cadastro.cep || "";

    if (c.endereco) {

        c.endereco.value = cadastro.endereco || "";

        // se não tem endereço salvo, deixa digitar
        if (!cadastro.endereco) c.endereco.readOnly = false;

    }

    if (c.bairro) {

        c.bairro.value = cadastro.bairro || "";

        if (!cadastro.bairro) c.bairro.readOnly = false;

    }

    if (c.numero) c.numero.value = cadastro.numero || "";

    if (c.telefone) c.telefone.value = cadastro.telefone || "";

    // administrador editando outra pessoa: o botão Voltar vai para a lista
    const voltar = document.getElementById("linkVoltar");

    if (voltar && perfilEditandoOutro) voltar.href = "listacadastro.html";

    // avisa no console se algum campo não foi encontrado
    PERFIL_ORDEM.forEach(function (nome) {

        if (!c[nome] && nome !== "confirmarSenha") {

            console.warn("Meu Perfil: campo não encontrado ->", nome);

        }

    });

}


// -----------------------------------------------------
// SALVAR AS ALTERAÇÕES
// -----------------------------------------------------

function salvarPerfil() {

    // evita executar duas vezes seguidas (clique + envio do formulário)
    const agora = Date.now();

    if (agora - perfilUltimoSalvar < 600) return;

    perfilUltimoSalvar = agora;

    const c = perfilCampos;

    const cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    const indice = cadastros.findIndex(item => String(item.id) === String(perfilCadastroId));

    if (indice === -1) {

        alert("Cadastro não encontrado!");

        return;

    }

    const nome = c.nome ? c.nome.value.trim() : "";

    if (nome === "") {

        alert("Preencha o nome!");

        return;

    }

    const cadastro = cadastros[indice];

    // ----- troca de senha (opcional) -----

    const novaSenha = c.novaSenha ? c.novaSenha.value : "";

    if (novaSenha !== "") {

        // o próprio usuário precisa confirmar a senha atual
        if (!perfilEditandoOutro) {

            const senhaAtual = c.senhaAtual ? c.senhaAtual.value : "";

            if (senhaAtual === "") {

                alert("Digite a senha atual para trocar a senha.");

                return;

            }

            if (senhaAtual !== cadastro.senha) {

                alert("A senha atual está incorreta!");

                return;

            }

        }

        if (novaSenha.length < 4) {

            alert("A nova senha precisa ter pelo menos 4 caracteres.");

            return;

        }

        if (c.confirmarSenha && c.confirmarSenha.value !== novaSenha) {

            alert("A confirmação da nova senha não confere.");

            return;

        }

        cadastro.senha = novaSenha;

    }

    // ----- demais dados (o CPF não muda) -----

    cadastro.nome = nome;

    if (c.cep) cadastro.cep = c.cep.value;

    if (c.endereco) cadastro.endereco = c.endereco.value;

    if (c.bairro) cadastro.bairro = c.bairro.value;

    if (c.numero) cadastro.numero = c.numero.value;

    if (c.telefone) cadastro.telefone = c.telefone.value;

    cadastros[indice] = cadastro;

    localStorage.setItem("cadastros", JSON.stringify(cadastros));

    // se o usuário alterou o próprio perfil, atualiza o nome da sessão
    if (!perfilEditandoOutro) {

        const logado = JSON.parse(localStorage.getItem("usuarioLogado"));

        if (logado) {

            logado.nome = nome;

            localStorage.setItem("usuarioLogado", JSON.stringify(logado));

        }

    }

    // limpa os campos de senha
    ["senhaAtual", "novaSenha", "confirmarSenha"].forEach(function (nomeCampo) {

        if (c[nomeCampo]) c[nomeCampo].value = "";

    });

    alert("Dados atualizados com sucesso!");

    if (perfilEditandoOutro) {

        window.location.href = "listacadastro.html";

    }

}


// o HTML pode chamar salvar() no botão
function salvar() {

    salvarPerfil();

}


// -----------------------------------------------------
// INICIAR A PÁGINA
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    carregarPerfil();

    const formulario = document.querySelector("form");

    if (formulario) {

        formulario.addEventListener("submit", function (evento) {

            evento.preventDefault();

            salvarPerfil();

        });

    }

    // botão sem onclick no HTML: liga o clique aqui
    const botao = document.querySelector(".botao-logar");

    if (botao && !botao.getAttribute("onclick")) {

        botao.addEventListener("click", salvarPerfil);

    }

});
