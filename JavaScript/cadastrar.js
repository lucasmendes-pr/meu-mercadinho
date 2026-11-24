function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function salvar() {

    const nome = document.getElementById("nome").value.trim();
    const cpf = somenteNumeros(document.getElementById("cpf").value);
    const senha = document.getElementById("senha").value;

    if (nome === "" || cpf === "" || senha === "") {
        alert("Preencha pelo menos nome, CPF e senha!");
        return;
    }

    if (cpf.length !== 11) {
        alert("O CPF precisa ter 11 números.");
        return;
    }

    if (senha.length < 4) {
        alert("A senha precisa ter pelo menos 4 caracteres.");
        return;
    }

    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    // Não permite CPF repetido
    if (cadastros.some(item => somenteNumeros(item.cpf) === cpf)) {
        alert("Já existe um usuário cadastrado com este CPF!");
        return;
    }

    const cadastro = {
        id: Date.now(),
        nome: nome,
        cep: document.getElementById("cep").value,
        endereco: document.getElementById("endereco").value,
        bairro: document.getElementById("bairro").value,
        numero: document.getElementById("numero").value,
        telefone: document.getElementById("telefone").value,
        cpf: cpf,   // salvo sempre só com números
        senha: senha
    };

    cadastros.push(cadastro);

    localStorage.setItem("cadastros", JSON.stringify(cadastros));

    alert("Usuário cadastrado com sucesso!");

    document.getElementById("cadasform").reset();

    // Se quem cadastrou foi o administrador, volta para a lista de usuários
    const logado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (logado && somenteNumeros(logado.cpf) === "12287734910") {
        window.location.href = "listacadastro.html";
    }

}