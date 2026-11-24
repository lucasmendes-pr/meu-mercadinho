
// =====================================================
// IDENTIFICAR O USUÁRIO E SEU CARRINHO
// =====================================================

function obterUsuarioLogado() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario || usuario.id === undefined || usuario.id === null) {

        alert("Faça login para acessar seu carrinho.");

        window.location.href = "login.html";

        return null;
    }

    return usuario;
}


// CHAVE INDIVIDUAL DO CARRINHO

function obterChaveCarrinho() {

    const usuario = obterUsuarioLogado();

    if (!usuario) return null;

    return "carrinho_" + usuario.id;
}


// BUSCAR CARRINHO DO USUÁRIO

function obterCarrinhoAtual() {

    const chave = obterChaveCarrinho();

    if (!chave) return [];

    return JSON.parse(localStorage.getItem(chave)) || [];
}


// SALVAR CARRINHO DO USUÁRIO

function salvarCarrinhoAtual(carrinho) {

    const chave = obterChaveCarrinho();

    if (!chave) return;

    localStorage.setItem(chave, JSON.stringify(carrinho));
}


// =====================================================
// BUSCAR ESTOQUE DO PRODUTO
// =====================================================

function obterEstoque(id) {

    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const produto = produtos.find(item => item.id === id);

    return produto ? Number(produto.quantidade) : 0;
}


// =====================================================
// FORMATAR VALORES EM REAIS
// =====================================================

function formatarMoeda(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// =====================================================
// CALCULAR TOTAL DO CARRINHO
// =====================================================

function calcularTotalCarrinho() {

    const carrinho = obterCarrinhoAtual();

    return carrinho.reduce((total, produto) => {

        return total + (
            Number(produto.preco) *
            Number(produto.quantidadeCarrinho)
        );

    }, 0);

}


// =====================================================
// CARREGAR CARRINHO
// =====================================================

function carregarCarrinho() {

    const usuario = obterUsuarioLogado();

    if (!usuario) return;

    const carrinho = obterCarrinhoAtual();

    const area = document.getElementById("dadosCarrinho");

    const mensagem = document.getElementById("mensagemCarrinho");

    if (!area || !mensagem) return;

    area.innerHTML = "";

    let total = 0;

    let quantidadeItens = 0;

    if (carrinho.length === 0) {

        mensagem.textContent = "Seu carrinho está vazio.";

        document.getElementById("totalItens").textContent = "0";

        document.getElementById("valorTotal").textContent = "R$ 0,00";

        document.getElementById("btnFinalizar").disabled = true;

        atualizarTroco();

        return;

    }

    document.getElementById("btnFinalizar").disabled = false;

    mensagem.textContent = "";

    carrinho.forEach(produto => {

        const estoque = obterEstoque(produto.id);

        const quantidadeCarrinho = Number(produto.quantidadeCarrinho) || 0;

        const subtotal = Number(produto.preco) * quantidadeCarrinho;

        total += subtotal;

        quantidadeItens += quantidadeCarrinho;


        // CARD

        const card = document.createElement("div");

        card.className = "card shadow-sm mb-3";


        const linha = document.createElement("div");

        linha.className = "row g-0 align-items-center";


        // IMAGEM

        const colunaImagem = document.createElement("div");

        colunaImagem.className = "col-4 col-md-3";


        const imagem = document.createElement("img");

        imagem.src = produto.imgProduto || "";

        imagem.alt = produto.descricao;

        imagem.style.width = "100%";

        imagem.style.height = "140px";

        imagem.style.objectFit = "contain";

        imagem.style.padding = "10px";


        imagem.onerror = function () {

            this.alt = "Imagem não disponível";

        };


        colunaImagem.appendChild(imagem);


        // INFORMAÇÕES

        const colunaInfo = document.createElement("div");

        colunaInfo.className = "col-8 col-md-9";


        const corpo = document.createElement("div");

        corpo.className = "card-body";


        const nome = document.createElement("h5");

        nome.textContent = produto.descricao;


        const preco = document.createElement("p");

        preco.className = "text-success fw-bold";

        preco.textContent = formatarMoeda(produto.preco);


        const subtotalTexto = document.createElement("p");

        subtotalTexto.textContent = "Subtotal: " + formatarMoeda(subtotal);


        const situacao = document.createElement("p");


        if (estoque <= 0) {

            situacao.textContent = "Produto indisponível";

            situacao.className = "text-danger fw-bold";

        } else if (quantidadeCarrinho > estoque) {

            situacao.textContent = "Quantidade no carrinho maior que o estoque!";

            situacao.className = "text-danger fw-bold";

        } else {

            situacao.textContent = "Disponível: " + estoque + " unidades";

            situacao.className = "text-muted";

        }


        // CONTROLES DE QUANTIDADE

        const controles = document.createElement("div");

        controles.className = "d-flex align-items-center gap-2 flex-wrap";


        const diminuir = document.createElement("button");

        diminuir.className = "btn btn-outline-secondary btn-sm";

        diminuir.textContent = "-";

        diminuir.disabled = quantidadeCarrinho <= 1;

        diminuir.onclick = function () {

            alterarQuantidade(produto.id, -1);

        };


        const quantidade = document.createElement("strong");

        quantidade.textContent = quantidadeCarrinho;


        const aumentar = document.createElement("button");

        aumentar.className = "btn btn-outline-secondary btn-sm";

        aumentar.textContent = "+";

        aumentar.disabled = estoque <= 0 || quantidadeCarrinho >= estoque;

        aumentar.onclick = function () {

            alterarQuantidade(produto.id, 1);

        };


        const remover = document.createElement("button");

        remover.className = "btn btn-outline-danger btn-sm";

        remover.textContent = "Remover";

        remover.onclick = function () {

            removerProduto(produto.id);

        };


        controles.appendChild(diminuir);

        controles.appendChild(quantidade);

        controles.appendChild(aumentar);

        controles.appendChild(remover);


        corpo.appendChild(nome);

        corpo.appendChild(preco);

        corpo.appendChild(subtotalTexto);

        corpo.appendChild(situacao);

        corpo.appendChild(controles);


        colunaInfo.appendChild(corpo);

        linha.appendChild(colunaImagem);

        linha.appendChild(colunaInfo);

        card.appendChild(linha);

        area.appendChild(card);

    });


    document.getElementById("totalItens").textContent = quantidadeItens;

    document.getElementById("valorTotal").textContent = formatarMoeda(total);

    atualizarTroco();

}


// =====================================================
// ALTERAR QUANTIDADE
// =====================================================

function alterarQuantidade(id, valor) {

    let carrinho = obterCarrinhoAtual();

    const produtoCarrinho = carrinho.find(item => item.id === id);

    if (!produtoCarrinho) return;

    const estoque = obterEstoque(id);

    const novaQuantidade = Number(produtoCarrinho.quantidadeCarrinho) + valor;

    if (novaQuantidade < 1) return;

    if (novaQuantidade > estoque) {

        alert("Quantidade indisponível! Estoque atual: " + estoque);

        return;

    }

    produtoCarrinho.quantidadeCarrinho = novaQuantidade;

    salvarCarrinhoAtual(carrinho);

    carregarCarrinho();

}


// =====================================================
// REMOVER PRODUTO
// =====================================================

function removerProduto(id) {

    let carrinho = obterCarrinhoAtual();

    carrinho = carrinho.filter(produto => produto.id !== id);

    salvarCarrinhoAtual(carrinho);

    carregarCarrinho();

}


// =====================================================
// LIMPAR CARRINHO
// =====================================================

function limparCarrinho() {

    if (!confirm("Deseja realmente limpar seu carrinho?")) return;

    salvarCarrinhoAtual([]);

    carregarCarrinho();

}


// =====================================================
// MOSTRAR CAMPO DE DINHEIRO
// =====================================================

function atualizarFormaPagamento() {

    const forma = document.getElementById("formaPagamento").value;

    const areaDinheiro = document.getElementById("areaDinheiro");

    if (forma === "Dinheiro") {

        areaDinheiro.style.display = "block";

    } else {

        areaDinheiro.style.display = "none";

    }

    atualizarTroco();

}


// =====================================================
// CALCULAR TROCO
// =====================================================

function atualizarTroco() {

    const forma = document.getElementById("formaPagamento").value;

    const campoRecebido = document.getElementById("valorRecebido");

    const valorRecebido = Number(campoRecebido.value);

    const total = calcularTotalCarrinho();

    const campoTroco = document.getElementById("troco");


    if (forma !== "Dinheiro" || !campoRecebido.value) {

        campoTroco.textContent = "R$ 0,00";

        return;

    }

    if (valorRecebido >= total) {

        campoTroco.textContent = formatarMoeda(valorRecebido - total);

    } else {

        campoTroco.textContent = "Valor insuficiente";

    }

}


// =====================================================
// FINALIZAR VENDA
// =====================================================

function finalizarVenda() {

    const usuario = obterUsuarioLogado();

    if (!usuario) return;

    let carrinho = obterCarrinhoAtual();

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];


    const formaPagamento = document.getElementById("formaPagamento").value;

    const total = calcularTotalCarrinho();

    const campoRecebido = document.getElementById("valorRecebido");

    const valorRecebido = Number(campoRecebido.value);


    // VERIFICAR CARRINHO

    if (carrinho.length === 0) {

        alert("Seu carrinho está vazio!");

        return;

    }


    // VERIFICAR PAGAMENTO

    if (formaPagamento === "") {

        alert("Selecione uma forma de pagamento!");

        return;

    }


    // VERIFICAR ESTOQUE

    for (const item of carrinho) {

        const produtoEstoque = produtos.find(
            produto => produto.id === item.id
        );

        if (!produtoEstoque) {

            alert("O produto " + item.descricao + " não está mais cadastrado!");

            return;

        }

        if (Number(item.quantidadeCarrinho) > Number(produtoEstoque.quantidade)) {

            alert(
                "Estoque insuficiente para o produto: " + item.descricao +
                ". Estoque disponível: " + produtoEstoque.quantidade
            );

            return;

        }

    }


    // VERIFICAR DINHEIRO

    if (formaPagamento === "Dinheiro") {

        if (
            campoRecebido.value === "" ||
            valorRecebido < total
        ) {

            alert("O valor recebido é insuficiente para finalizar a compra!");

            return;

        }

    }


    // CONFIRMAR

    if (!confirm("Deseja confirmar e finalizar esta venda?")) {

        return;

    }


    // BAIXAR ESTOQUE COMPARTILHADO

    carrinho.forEach(item => {

        const produtoEstoque = produtos.find(
            produto => produto.id === item.id
        );

        produtoEstoque.quantidade =
            Number(produtoEstoque.quantidade) -
            Number(item.quantidadeCarrinho);

    });


    // REGISTRAR VENDA

    const venda = {

        id: Date.now(),

        usuarioId: usuario.id,

        nomeUsuario: usuario.nome,

        cpfUsuario: usuario.cpf || "",

        data: new Date().toLocaleString("pt-BR"),

        produtos: carrinho.map(item => ({

            id: item.id,

            descricao: item.descricao,

            preco: Number(item.preco),

            quantidade: Number(item.quantidadeCarrinho),

            subtotal:
                Number(item.preco) *
                Number(item.quantidadeCarrinho)

        })),

        total: total,

        formaPagamento: formaPagamento,

        valorRecebido: formaPagamento === "Dinheiro" ? valorRecebido : total,

        troco: formaPagamento === "Dinheiro"
            ? valorRecebido - total
            : 0

    };


    vendas.push(venda);


    // SALVAR DADOS

    try {

        localStorage.setItem("produtos", JSON.stringify(produtos));

        localStorage.setItem("vendas", JSON.stringify(vendas));

        // LIMPAR SOMENTE O CARRINHO DESTE USUÁRIO
        salvarCarrinhoAtual([]);

        alert(
            "Venda realizada com sucesso!\n\n" +
            "Total: " + formatarMoeda(total) + "\n" +
            "Pagamento: " + formaPagamento + "\n" +
            "Troco: " + formatarMoeda(venda.troco)
        );


        // ATUALIZAR TELA

        document.getElementById("formaPagamento").value = "";

        document.getElementById("valorRecebido").value = "";

        atualizarFormaPagamento();

        carregarCarrinho();

    } catch (erro) {

        console.error("Erro ao registrar venda:", erro);

        alert("Não foi possível registrar a venda. Tente novamente.");

    }

}


// =====================================================
// INICIALIZAR PÁGINA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const usuario = obterUsuarioLogado();

    if (!usuario) return;

    document.getElementById("formaPagamento").addEventListener(
        "change",
        atualizarFormaPagamento
    );

    document.getElementById("valorRecebido").addEventListener(
        "input",
        atualizarTroco
    );

    document.getElementById("btnFinalizar").addEventListener(
        "click",
        finalizarVenda
    );

    carregarCarrinho();

});
