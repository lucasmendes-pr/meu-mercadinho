
// =====================================================
// HISTÓRICO DE VENDAS
// - cliente: vê só as compras dele
// - administrador: vê tudo + ranking dos mais vendidos
// usa ehAdministrador() do permissoes.js
// =====================================================

let usuarioAtual = null;
let administrador = false;

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criar(tag, classe, texto) {

    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function criarTabela(cabecalhos, linhas) {

    const envolta = criar("div", "table-responsive");
    const tabela = criar("table", "table table-striped align-middle mb-0");

    const thead = criar("thead");
    const trHead = criar("tr");

    cabecalhos.forEach(texto => trHead.appendChild(criar("th", "", texto)));
    thead.appendChild(trHead);

    const tbody = criar("tbody");

    linhas.forEach(linha => {
        const tr = criar("tr");
        linha.forEach(texto => tr.appendChild(criar("td", "", texto)));
        tbody.appendChild(tr);
    });

    tabela.appendChild(thead);
    tabela.appendChild(tbody);
    envolta.appendChild(tabela);

    return envolta;
}

function obterVendas() {

    const todas = JSON.parse(localStorage.getItem("vendas")) || [];

    let lista;

    if (administrador) {

        const filtro = document.getElementById("filtroCliente").value;

        lista = filtro === ""
            ? todas
            : todas.filter(v => String(v.usuarioId) === filtro);

    } else {

        lista = todas.filter(v => String(v.usuarioId) === String(usuarioAtual.id));
    }

    // mais recentes primeiro
    return lista.slice().sort((a, b) => b.id - a.id);
}

function montarFiltro() {

    const todas = JSON.parse(localStorage.getItem("vendas")) || [];
    const select = document.getElementById("filtroCliente");

    const clientes = {};

    todas.forEach(v => {
        clientes[v.usuarioId] = v.nomeUsuario;
    });

    Object.keys(clientes).forEach(id => {
        const opcao = criar("option", "", clientes[id]);
        opcao.value = id;
        select.appendChild(opcao);
    });

    select.addEventListener("change", renderizar);
}

function renderizarResumo(lista) {

    const area = document.getElementById("resumoVendas");
    area.innerHTML = "";

    let totalValor = 0;
    let totalItens = 0;

    lista.forEach(v => {
        totalValor += Number(v.total) || 0;
        (v.produtos || []).forEach(p => totalItens += Number(p.quantidade) || 0);
    });

    const dados = [
        [administrador ? "Vendas realizadas" : "Compras realizadas", String(lista.length)],
        ["Itens " + (administrador ? "vendidos" : "comprados"), String(totalItens)],
        [administrador ? "Total vendido" : "Total gasto", formatarMoeda(totalValor)]
    ];

    dados.forEach(item => {

        const coluna = criar("div", "col-12 col-md-4");
        const card = criar("div", "card shadow-sm text-center h-100");
        const corpo = criar("div", "card-body");

        corpo.appendChild(criar("p", "text-muted mb-1", item[0]));
        corpo.appendChild(criar("h3", "text-success mb-0", item[1]));

        card.appendChild(corpo);
        coluna.appendChild(card);
        area.appendChild(coluna);
    });
}

function renderizarRanking(lista) {

    const area = document.getElementById("rankingProdutos");
    area.innerHTML = "";

    const mapa = {};

    lista.forEach(v => {
        (v.produtos || []).forEach(p => {

            if (!mapa[p.id]) {
                mapa[p.id] = { descricao: p.descricao, quantidade: 0, receita: 0 };
            }

            mapa[p.id].quantidade += Number(p.quantidade) || 0;
            mapa[p.id].receita += Number(p.subtotal) || 0;
        });
    });

    const ranking = Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade);

    if (ranking.length === 0) {
        area.appendChild(criar("p", "text-muted", "Nenhuma venda registrada ainda."));
        return;
    }

    const linhas = ranking.map((item, i) => [
        (i === 0 ? "🏆 " : "") + (i + 1) + "º",
        item.descricao,
        String(item.quantidade),
        formatarMoeda(item.receita)
    ]);

    area.appendChild(criarTabela(["Posição", "Produto", "Qtd. vendida", "Receita"], linhas));
}

function renderizarLista(lista) {

    const area = document.getElementById("listaVendas");
    const mensagem = document.getElementById("mensagemVendas");

    area.innerHTML = "";

    if (lista.length === 0) {
        mensagem.textContent = administrador
            ? "Nenhuma venda registrada."
            : "Você ainda não fez nenhuma compra.";
        return;
    }

    mensagem.textContent = "";

    lista.forEach(venda => {

        const card = criar("div", "card shadow-sm mb-3");

        const cabecalho = criar("div", "card-header d-flex justify-content-between flex-wrap gap-2");
        cabecalho.appendChild(criar("strong", "", "Venda #" + venda.id + " • " + venda.data));
        cabecalho.appendChild(criar("strong", "text-success", formatarMoeda(venda.total)));

        const corpo = criar("div", "card-body");

        if (administrador) {
            corpo.appendChild(criar("p", "mb-2", "Cliente: " + venda.nomeUsuario + " (CPF " + (venda.cpfUsuario || "-") + ")"));
        }

        const linhas = (venda.produtos || []).map(p => [
            p.descricao,
            String(p.quantidade),
            formatarMoeda(p.preco),
            formatarMoeda(p.subtotal)
        ]);

        corpo.appendChild(criarTabela(["Produto", "Qtd.", "Preço un.", "Subtotal"], linhas));

        let pagamento = "Pagamento: " + venda.formaPagamento;

        if (venda.formaPagamento === "Dinheiro") {
            pagamento += " • Recebido: " + formatarMoeda(venda.valorRecebido) +
                " • Troco: " + formatarMoeda(venda.troco);
        }

        corpo.appendChild(criar("p", "text-muted mt-3 mb-0", pagamento));

        card.appendChild(cabecalho);
        card.appendChild(corpo);
        area.appendChild(card);
    });
}

function renderizar() {

    const lista = obterVendas();

    renderizarResumo(lista);

    if (administrador) renderizarRanking(lista);

    renderizarLista(lista);
}

document.addEventListener("DOMContentLoaded", function () {

    usuarioAtual = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioAtual) return;

    administrador = ehAdministrador(usuarioAtual);

    document.getElementById("tituloHistorico").textContent =
        administrador ? "📊 Histórico de Vendas" : "🧾 Minhas Compras";

    if (administrador) {
        document.getElementById("areaAdmin").style.display = "block";
        montarFiltro();
    }

    renderizar();
});
