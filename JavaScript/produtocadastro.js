
// PRÉ-VISUALIZAÇÃO DA IMAGEM

document.getElementById("imgProduto").addEventListener("change", function () {

    const arquivo = this.files[0];

    const preview = document.getElementById("previewImagem");

    if (arquivo) {

        preview.src = URL.createObjectURL(arquivo);

        preview.style.display = "block";

    } else {

        preview.style.display = "none";

    }

});


// CADASTRAR PRODUTO

function salvar() {

    const arquivo = document.getElementById("imgProduto").files[0];

    const descricao = document.getElementById("descricao").value.trim();
   
    const quantidade = document.getElementById("quantidade").value;


    const preco = document.getElementById("preco").value;

    // VERIFICAR CAMPOS

    if (!arquivo || descricao === "" ||quantidade === "" || preco === "") {

        alert("Preencha todos os campos!");

        return;

    }

    if (Number(preco) < 0) {

        alert("O preço não pode ser negativo!");

        return;

    }

    if (!arquivo.type.startsWith("image/")) {

        alert("Selecione um arquivo de imagem!");

        return;

    }

    // LER IMAGEM

    const leitor = new FileReader();

    leitor.onload = function () {

        const produto = {

            id: Date.now(),

            imgProduto: leitor.result,

            descricao: descricao,

            quantidade: quantidade,


            preco: Number(preco)

        };

        // BUSCAR PRODUTOS SALVOS

        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        // ADICIONAR PRODUTO

        produtos.push(produto);

        // SALVAR NO LOCALSTORAGE

        try {

            localStorage.setItem("produtos", JSON.stringify(produtos));

            alert("Produto cadastrado com sucesso!");

            // LIMPAR CAMPOS

            document.getElementById("imgProduto").value = "";

            document.getElementById("descricao").value = "";

            document.getElementById("quantidade").value = "";

            document.getElementById("preco").value = "";

            document.getElementById("previewImagem").src = "";

            document.getElementById("previewImagem").style.display = "none";

        } catch (erro) {

            alert("Não foi possível salvar. A imagem pode ser muito grande para o armazenamento do navegador.");

            console.error(erro);

        }

    };

    leitor.onerror = function () {

        alert("Erro ao carregar a imagem!");

    };

    leitor.readAsDataURL(arquivo);

}


// LISTAR PRODUTOS


function carregar() {

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    // Recuperar usuário logado
    let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));


    let areaProdutos = document.getElementById("dados");

    let mensagem = document.getElementById("mensagem");

    if (!areaProdutos) return;

    areaProdutos.innerHTML = "";

    if (produtos.length === 0) {

        mensagem.textContent = "Nenhum produto cadastrado.";

        return;

    }

    mensagem.textContent = "";

    produtos.forEach(item => {

        areaProdutos.innerHTML += `

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">

                <div class="card-produto">

                    <img
                        src="${item.imgProduto}"
                        class="imagem-produto"
                        alt="Imagem de ${item.descricao}"
                    >

                    <div class="corpo-card">

                        <h2 class="nome-produto">
                            ${item.descricao}
                        </h2>

                        <p class="quantidade-produto">
                            Estoque disponível: ${item.quantidade} unidades
                        </p>

                        <p class="preco-produto">
                            R$ ${Number(item.preco).toFixed(2).replace(".", ",")}
                        </p>
                          ${usuario && usuario.tipoUsuario === "administrador" ? `



                        <button
                            class="botao-excluir"
                            onclick="excluirRegistro(${item.id})"
                        >
                            Excluir produto
                        </button>
                         ` : ""}

                    </div>

                </div>

            </div>

        `;

    });

}

// EXCLUIR PRODUTO

function excluirRegistro(id) {

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    produtos = produtos.filter(item => item.id !== id);

    localStorage.setItem("produtos", JSON.stringify(produtos));

    carregar();

    alert("Produto excluído com sucesso!");

}
function sair() {

    localStorage.removeItem("usuarioLogado");

    window.location.href = "login.html";

}



// =====================================
// CARREGAR PÁGINA DE PRODUTOS
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    carregar();

});
 