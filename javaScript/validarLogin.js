function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function validarLogin(event) {

    event.preventDefault();

    // CPF digitado, sem pontos e traço
    const cpf = somenteNumeros(document.getElementById("cpf").value);
    const senha = document.getElementById("senha").value;

    // CPF DO ÚNICO ADMINISTRADOR
    const cpfAdministrador = "12287734910";

    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];

    // Compara só os números (funciona com cadastros antigos que tenham pontos)
    const usuario = cadastros.find(item =>
        somenteNumeros(item.cpf) === cpf && item.senha === senha
    );

    if (usuario) {

        const cpfLimpo = somenteNumeros(usuario.cpf);

        const tipoUsuario = cpfLimpo === cpfAdministrador
            ? "administrador"
            : "cliente";

        localStorage.setItem("usuarioLogado", JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            cpf: cpfLimpo,
            tipoUsuario: tipoUsuario
        }));

        alert(
            "Login realizado com sucesso!\nBem-vindo, " +
            usuario.nome +
            "\nAcesso: " + tipoUsuario
        );

        window.location.href = "home.html";

    } else {

        alert("CPF ou senha inválidos!");

    }

}