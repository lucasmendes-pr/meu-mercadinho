// =====================================================
// PRODUTOS: cadastrar, editar, listar e excluir
// Usado por cadastroProduto.html e listaProduto.html
// =====================================================

// Produto que está sendo editado (null = cadastro novo)
let produtoEmEdicao = null;


// -----------------------------------------------------
// PRÉ-VISUALIZAÇÃO DA IMAGEM (só existe no cadastro)
// -----------------------------------------------------

const campoImagem = document.getElementById("imgProduto");

if (campoImagem) {

    campoImagem.addEventListener("change", function () {

        const arquivo = this.files[0];

        const preview = document.getElementById("previewImagem");

        if (arquivo) {

            preview.src = URL.createObjectURL(arquivo);

            preview.style.display = "block";

        } else if (produtoEmEdicao) {

            // voltou a ficar sem arquivo: mostra a imagem atual do produto
            preview.src = produtoEmEdicao.imgProduto;

            preview.style.display = "block";

        } else {

            preview.style.display = "none";

        }

    });

}


// -----------------------------------------------------
// MODO EDIÇÃO: cadastroProduto.html?id=123
// -----------------------------------------------------

function carregarProdutoParaEdicao() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    // não é edição, ou não está na tela de cadastro
    if (!id || !document.getElementById("descricao")) return;

    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const produto = produtos.find(item => String(item.id) === String(id));

    if (!produto) {

        alert("Produto não encontrado!");

        window.location.href = "listaProduto.html";

        return;

    }

    produtoEmEdicao = produto;

    document.getElementById("descricao").value = produto.descricao;

    document.getElementById("quantidade").value = produto.quantidade;

    document.getElementById("preco").value = produto.preco;

    const preview = document.getElementById("previewImagem");

    if (preview && produto.imgProduto) {

        preview.src = produto.imgProduto;

        preview.style.display = "block";

    }

    // ajusta os textos da tela
    const titulo = document.querySelector(".topo-login h1");

    if (titulo) titulo.textContent = "Editar produto";

    const botao = document.querySelector(".botao-logar");

    if (botao) botao.textContent = "Salvar alterações";

}


// -----------------------------------------------------
// SALVAR (cadastra um produto novo ou atualiza o existente)
// -----------------------------------------------------

function salvar() {

    const arquivo = document.getElementById("imgProduto").files[0];

    const descricao = document.getElementById("descricao").value.trim();

    const quantidade = document.getElementById("quantidade").value;

    const preco = document.getElementById("preco").value;

    const editando = produtoEmEdicao !== null;

    // VERIFICAR CAMPOS
    // (na edição a imagem é opcional: se não escolher, mantém a atual)

    if ((!editando && !arquivo) || descricao === "" || quantidade === "" || preco === "") {

        alert("Preencha todos os campos!");

        return;

    }

    if (Number(preco) < 0) {

        alert("O preço não pode ser negativo!");

        return;

    }

    if (Number(quantidade) < 0) {

        alert("A quantidade não pode ser negativa!");

        return;

    }

    if (arquivo && !arquivo.type.startsWith("image/")) {

        alert("Selecione um arquivo de imagem!");

        return;

    }

    // COM IMAGEM NOVA: lê o arquivo e grava

    if (arquivo) {

        const leitor = new FileReader();

        leitor.onload = function () {

            gravarProduto(leitor.result, descricao, quantidade, preco);

        };

        leitor.onerror = function () {

            alert("Erro ao carregar a imagem!");

        };

        leitor.readAsDataURL(arquivo);

        return;

    }

    // SEM IMAGEM NOVA (só na edição): mantém a imagem atual

    gravarProduto(produtoEmEdicao.imgProduto, descricao, quantidade, preco);

}


function gravarProduto(imagem, descricao, quantidade, preco) {

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    if (produtoEmEdicao) {

        // ATUALIZA O PRODUTO EXISTENTE (mesmo id, então o histórico não se perde)

        const indice = produtos.findIndex(item => item.id === produtoEmEdicao.id);

        if (indice === -1) {

            alert("Produto não encontrado!");

            return;

        }

        produtos[indice] = {

            ...produtos[indice],

            imgProduto: imagem,

            descricao: descricao,

            quantidade: Number(quantidade),

            preco: Number(preco)

        };

    } else {

        // PRODUTO NOVO

        produtos.push({

            id: Date.now(),

            imgProduto: imagem,

            descricao: descricao,

            quantidade: Number(quantidade),

            preco: Number(preco)

        });

    }

    try {

        localStorage.setItem("produtos", JSON.stringify(produtos));

        if (produtoEmEdicao) {

            alert("Produto atualizado com sucesso!");

            window.location.href = "listaProduto.html";

            return;

        }

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

}


// -----------------------------------------------------
// LISTAR PRODUTOS (listaProduto.html)
// -----------------------------------------------------

function escaparHtml(texto) {

    return String(texto === undefined || texto === null ? "" : texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}


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

    const ehAdmin = usuario && usuario.tipoUsuario === "administrador";

    produtos.forEach(item => {

        // o status vem da quantidade: acabou = indisponível
        const estoque = Number(item.quantidade) || 0;

        const textoEstoque = estoque > 0
            ? "Estoque disponível: " + estoque + " unidades"
            : "Produto indisponível (sem estoque)";

        const estiloEstoque = estoque > 0 ? "" : "color:#c62828;";

        areaProdutos.innerHTML += `

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">

                <div class="card-produto">

                    <img
                        src="${item.imgProduto}"
                        class="imagem-produto"
                        alt="Imagem de ${escaparHtml(item.descricao)}"
                    >

                    <div class="corpo-card">

                        <h2 class="nome-produto">
                            ${escaparHtml(item.descricao)}
                        </h2>

                        <p class="quantidade-produto" style="${estiloEstoque}">
                            ${textoEstoque}
                        </p>

                        <p class="preco-produto">
                            R$ ${Number(item.preco).toFixed(2).replace(".", ",")}
                        </p>

                        ${ehAdmin ? `

                        <a
                            href="cadastroProduto.html?id=${item.id}"
                            class="botao-voltar"
                            style="width:100%; margin-bottom:10px;"
                        >
                            Editar produto
                        </a>

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


// -----------------------------------------------------
// EXCLUIR PRODUTO
// -----------------------------------------------------

function excluirRegistro(id) {

    if (!confirm("Deseja realmente excluir este produto?")) return;

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


// -----------------------------------------------------
// INICIAR PÁGINA
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    carregarProdutoParaEdicao();

    carregar();

});