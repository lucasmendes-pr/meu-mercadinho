
// =====================================
// IDENTIFICAR USUÁRIO LOGADO
// =====================================

function obterUsuarioLogado() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario || usuario.id === undefined || usuario.id === null) {

        alert("Faça login para continuar!");

        window.location.href = "login.html";

        return null;
    }

    return usuario;
}


// =====================================
// IDENTIFICAR CARRINHO DO USUÁRIO
// =====================================

function obterChaveCarrinho() {

    const usuario = obterUsuarioLogado();

    if (!usuario) return null;

    return "carrinho_" + usuario.id;
}


// =====================================
// MOSTRAR PRODUTOS NA HOME
// =====================================

function mostrarLista(produtos) {

    const areaProdutos = document.getElementById("dadosProdutos");
    const mensagem = document.getElementById("mensagemProdutos");

    areaProdutos.innerHTML = "";
    mensagem.textContent = "";

    if (produtos.length === 0) {

        mensagem.textContent = "Nenhum produto encontrado.";

        return;
    }

    produtos.forEach(produto => {

        const coluna = document.createElement("div");

        coluna.className = "col-12 col-sm-6 col-lg-4 col-xl-3";


        const card = document.createElement("div");

        card.className = "card h-100 shadow-sm";


        // IMAGEM

        const imagem = document.createElement("img");

        imagem.src = produto.imgProduto || "";

        imagem.alt = produto.descricao || "Produto";

        imagem.style.width = "100%";

        imagem.style.height = "200px";

        imagem.style.objectFit = "contain";

        imagem.style.padding = "10px";


        imagem.onerror = function () {

            this.alt = "Imagem não disponível";

        };


        // CORPO

        const corpo = document.createElement("div");

        corpo.className = "card-body";


        // DESCRIÇÃO

        const nome = document.createElement("h5");

        nome.className = "card-title";

        nome.textContent = produto.descricao || "Produto";


        // PREÇO

        const preco = document.createElement("h5");

        preco.className = "text-success fw-bold";

        preco.textContent = Number(produto.preco || 0).toLocaleString("pt-BR", {

            style: "currency",

            currency: "BRL"

        });


        // ESTOQUE

        const quantidade = document.createElement("p");

        quantidade.className = "text-muted";

        const estoque = Number(produto.quantidade) || 0;


        quantidade.textContent = estoque > 0

            ? "Disponível: " + estoque + " unidades"

            : "Produto indisponível";


        // BOTÃO

        const botao = document.createElement("button");

        botao.type = "button";

        botao.className = "btn btn-success w-100";

        botao.textContent = estoque > 0

            ? "Adicionar ao carrinho"

            : "Indisponível";

        botao.disabled = estoque <= 0;


        botao.addEventListener("click", function () {

            adicionarCarrinho(produto.id);

        });


        // MONTAR CARD

        corpo.appendChild(nome);

        corpo.appendChild(preco);

        corpo.appendChild(quantidade);

        corpo.appendChild(botao);


        card.appendChild(imagem);

        card.appendChild(corpo);


        coluna.appendChild(card);

        areaProdutos.appendChild(coluna);

    });

}


// =====================================
// CARREGAR PRODUTOS
// =====================================

function carregarProdutos() {

    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const total = document.getElementById("totalProdutos");

    if (total) {

        total.textContent = produtos.length + " produtos";

    }

    mostrarLista(produtos);

}


// =====================================
// PESQUISAR PRODUTOS
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    const campoPesquisa = document.getElementById("pesquisaProduto");

    if (campoPesquisa) {

        campoPesquisa.addEventListener("input", function () {

            const pesquisa = this.value.toLowerCase();

            const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

            const filtrados = produtos.filter(produto =>

                (produto.descricao || "").toLowerCase().includes(pesquisa)

            );

            mostrarLista(filtrados);

        });

    }

});


// =====================================
// ADICIONAR PRODUTO AO CARRINHO
// =====================================

function adicionarCarrinho(id) {

    // IDENTIFICAR USUÁRIO

    const usuario = obterUsuarioLogado();

    if (!usuario) return;


    // BUSCAR PRODUTOS

    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];


    // BUSCAR CARRINHO INDIVIDUAL

    const chaveCarrinho = "carrinho_" + usuario.id;

    let carrinho = JSON.parse(localStorage.getItem(chaveCarrinho)) || [];


    // PROCURAR PRODUTO

    const produto = produtos.find(item => item.id === id);


    if (!produto) {

        alert("Produto não encontrado!");

        return;

    }


    // VERIFICAR ESTOQUE

    const estoque = Number(produto.quantidade) || 0;


    if (estoque <= 0) {

        alert("Produto indisponível!");

        return;

    }


    // VERIFICAR SE JÁ ESTÁ NO CARRINHO

    const existente = carrinho.find(item => item.id === id);


    if (existente) {

        if (Number(existente.quantidadeCarrinho) >= estoque) {

            alert("Quantidade máxima disponível no estoque!");

            return;

        }

        existente.quantidadeCarrinho++;

        existente.quantidade = estoque;

        existente.preco = Number(produto.preco);

        existente.descricao = produto.descricao;

        existente.imgProduto = produto.imgProduto;

    } else {

        carrinho.push({

            id: produto.id,

            descricao: produto.descricao,

            preco: Number(produto.preco),

            quantidade: estoque,

            imgProduto: produto.imgProduto,

            quantidadeCarrinho: 1

        });

    }


    // SALVAR SOMENTE NO CARRINHO DO USUÁRIO

    localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));


    alert("Produto adicionado ao seu carrinho!");

}


// =====================================
// SAIR
// =====================================

function sair() {

    localStorage.removeItem("usuarioLogado");

    window.location.href = "login.html";

}


// =====================================
// INICIAR PÁGINA
// =====================================

document.addEventListener("DOMContentLoaded", carregarProdutos);
