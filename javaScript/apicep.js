
async function buscarEndereco() {

    const cep = document.getElementById('cep').value.replace(/\D/g, '');

    const endereco = document.getElementById('endereco');
    const bairro = document.getElementById('bairro');

    // Verifica se o CEP tem 8 números
    if (cep.length !== 8) {
        alert("Digite um CEP válido com 8 números.");
        return;
    }

    try {

        // Consulta a API ViaCEP
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!resposta.ok) {
            throw new Error("Erro na conexão com a API.");
        }

        const dados = await resposta.json();

        // Verifica se o CEP existe
        if (dados.erro) {
            throw new Error("CEP não encontrado.");
        }

        // Preenche os campos
        endereco.value = dados.logradouro || "";
        bairro.value = dados.bairro || "";

        // Bloqueia os campos
        endereco.readOnly = true;
        bairro.readOnly = true;

        console.log("CEP encontrado:", dados);

    } catch (erro) {

        alert("Não foi possível encontrar o CEP. Digite o endereço manualmente.");

        console.error("Erro na API:", erro);

        // Limpa os campos
        endereco.value = "";
        bairro.value = "";

        // Libera para digitação manual
        endereco.readOnly = false;
        bairro.readOnly = false;

        endereco.focus();
    }
}
