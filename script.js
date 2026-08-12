import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// FIREBASE
// =====================================================

const firebaseConfig = {

    // ⚠️ MANTENHA SUA API KEY ORIGINAL
    apiKey: "SUA_API_KEY_ORIGINAL",

    authDomain: "dabruale-moda-intima.firebaseapp.com",

    databaseURL:
        "https://dabruale-moda-intima-default-rtdb.firebaseio.com",

    projectId:
        "dabruale-moda-intima",

    storageBucket:
        "dabruale-moda-intima.firebasestorage.app",

    messagingSenderId:
        "106483648309",

    appId:
        "1:106483648309:web:a1e116f7a2e43d653a2e7c"
};


// =====================================================
// INICIAR FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// =====================================================
// CARRINHO
// =====================================================

const carrinho = [];


// =====================================================
// PRODUTOS
// =====================================================

let produtos = [];


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const containerProdutos =
    document.getElementById("produtos");

const botaoCarrinho =
    document.getElementById("abrir-carrinho");

const telaProdutos =
    document.getElementById("tela-produtos");

const telaCarrinho =
    document.getElementById("tela-carrinho");

const telaEntrega =
    document.getElementById("tela-entrega");

const voltarProdutos =
    document.getElementById("voltar-produtos");

const irEntrega =
    document.getElementById("ir-entrega");

const voltarCarrinho =
    document.getElementById("voltar-carrinho");


// =====================================================
// URL DO PRODUTO INDIVIDUAL
// =====================================================
const parametros =
    new URLSearchParams(window.location.search);

const produtoCodigo =
    parametros.get("produto");
// =====================================================
// CARREGAR PRODUTOS DO FIREBASE
// =====================================================

const produtosRef =
    ref(database, "produtos");


onValue(produtosRef, function(snapshot) {

    produtos = [];

    const dados = snapshot.val();


    if (dados) {

        Object.keys(dados).forEach(function(id) {

            const produto =
                dados[id];


            // -----------------------------------------
            // TAMANHOS
            // -----------------------------------------

            let tamanhos = [];


            if (Array.isArray(produto.tamanhos)) {

                tamanhos =
                    produto.tamanhos.filter(function(tamanho) {

                        return (
                            tamanho !== null &&
                            tamanho !== undefined &&
                            String(tamanho).trim() !== ""
                        );

                    });

            }

            else if (
                produto.tamanhos &&
                typeof produto.tamanhos === "object"
            ) {

                tamanhos =
                    Object.values(produto.tamanhos).filter(
                        function(tamanho) {

                            return (
                                tamanho !== null &&
                                tamanho !== undefined &&
                                String(tamanho).trim() !== ""
                            );

                        }
                    );

            }


            // -----------------------------------------
            // PRODUTO
            // -----------------------------------------

            produtos.push({

                id: id,

                nome:
                    produto.nome ||
                    "Produto",

                preco:
                    Number(produto.preco) ||
                    0,

                tamanhos:
                    tamanhos,

                estoque:
                    produto.estoque ??
                    null,

                descricao:
                    produto.descricao ||
                    "",

                foto:
                    produto.foto ||
                    "",

                ativo:
                    produto.ativo !== false

            });

        });

    }


    // =================================================
    // MOSTRAR A PÁGINA CORRETA
    // =================================================

    mostrarPagina();

});


// =====================================================
// MOSTRAR PÁGINA
// =====================================================

function mostrarPagina() {

    if (produtoCodigo) {

        mostrarProdutoIndividual();

    }

    else {

        mostrarTodosProdutos();

    }

}


// =====================================================
// TODOS OS PRODUTOS
// =====================================================

function mostrarTodosProdutos() {

    if (!containerProdutos) {
        return;
    }


    // -----------------------------------------
    // RESTAURAR LAYOUT NORMAL
    // -----------------------------------------

    containerProdutos.style.display =
        "grid";


    containerProdutos.style.gridTemplateColumns =
        "";


    containerProdutos.style.gridColumn =
        "";


    containerProdutos.innerHTML =
        "";


    // -----------------------------------------
    // PRODUTOS ATIVOS
    // -----------------------------------------

    const produtosAtivos =
        produtos.filter(function(produto) {

            return produto.ativo !== false;

        });


    if (produtosAtivos.length === 0) {

        containerProdutos.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;

    }


    // -----------------------------------------
    // MOSTRAR PRODUTOS
    // -----------------------------------------

    produtosAtivos.forEach(function(produto, index) {

        const div =
            document.createElement("div");


        div.className =
            "produto";


        // =================================================
        // FOTO
        // =================================================

        if (produto.foto) {

            const imagem =
                document.createElement("img");


            imagem.src =
                produto.foto;


            imagem.alt =
                produto.nome;


            imagem.style.cursor =
                "pointer";


            imagem.addEventListener(
                "click",
                function() {

                    abrirProduto(produto.id);

                }
            );


            imagem.style.width =
                "100%";


            imagem.style.maxWidth =
                "300px";


            imagem.style.height =
                "300px";


            imagem.style.objectFit =
                "contain";


            imagem.style.borderRadius =
                "12px";


            imagem.style.display =
                "block";


            imagem.style.margin =
                "0 auto 15px";


            div.appendChild(imagem);

        }


        // =================================================
        // NOME
        // =================================================

        const titulo =
            document.createElement("h3");


        titulo.textContent =
            produto.nome;


        titulo.style.cursor =
            "pointer";


        titulo.addEventListener(
            "click",
            function() {

                abrirProduto(produto.id);

            }
        );


        div.appendChild(titulo);


        // =================================================
        // PREÇO
        // =================================================

        const preco =
            document.createElement("p");


        preco.innerHTML =
            "<strong>R$ " +
            produto.preco
                .toFixed(2)
                .replace(".", ",") +
            "</strong>";


        div.appendChild(preco);


        // =================================================
        // DESCRIÇÃO
        // =================================================

        if (produto.descricao) {

            const descricao =
                document.createElement("p");


            descricao.textContent =
                produto.descricao;


            div.appendChild(descricao);

        }


        // =================================================
        // TAMANHO
        // =================================================

        let selectTamanho =
            null;


        if (
            produto.tamanhos &&
            produto.tamanhos.length > 0
        ) {

            selectTamanho =
                document.createElement("select");


            selectTamanho.id =
                "tamanho-produto-" +
                index;


            const opcaoInicial =
                document.createElement("option");


            opcaoInicial.value =
                "";


            opcaoInicial.textContent =
                "Escolha o tamanho";


            opcaoInicial.disabled =
                true;


            opcaoInicial.selected =
                true;


            selectTamanho.appendChild(
                opcaoInicial
            );


            produto.tamanhos.forEach(
                function(tamanho) {

                    const option =
                        document.createElement("option");


                    option.value =
                        tamanho;


                    option.textContent =
                        tamanho;


                    selectTamanho.appendChild(
                        option
                    );

                }
            );


            div.appendChild(
                selectTamanho
            );

        }


        // =================================================
        // BOTÃO ADICIONAR AO CARRINHO
        // =================================================

        const botaoAdicionar =
            document.createElement("button");


        botaoAdicionar.type =
            "button";


        botaoAdicionar.textContent =
            "🛒 Adicionar ao carrinho";


        botaoAdicionar.addEventListener(
            "click",
            function() {

                let tamanho =
                    "Não informado";


                if (selectTamanho) {

                    tamanho =
                        selectTamanho.value;


                    if (!tamanho) {

                        alert(
                            "Escolha o tamanho do produto."
                        );

                        selectTamanho.focus();

                        return;

                    }

                }


                adicionarAoCarrinho(

                    produto.nome,

                    produto.preco,

                    tamanho,

                    produto.foto,

                    1

                );

            }
        );


        div.appendChild(
            botaoAdicionar
        );


        // =================================================
        // NÃO EXISTE MAIS "VER PRODUTO"
        // =================================================


        containerProdutos.appendChild(
            div
        );

    });


    // =================================================
    // MEU CARRINHO
    // =================================================

    if (botaoCarrinho) {

        botaoCarrinho.style.display =
            "block";


        botaoCarrinho.textContent =
            "🛒 Meu Carrinho";


        // garantir que fique depois dos produtos
        telaProdutos.appendChild(
            botaoCarrinho
        );

    }

}


// =====================================================
// ABRIR PRODUTO INDIVIDUAL
// =====================================================

function gerarCodigoProduto(nome) {

    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


function abrirProduto(id) {

    const produto =
        produtos.find(function(item) {

            return item.id === id;

        });

    if (!produto) {
        return;
    }

    const codigo =
        gerarCodigoProduto(produto.nome);

    window.location.href =
        window.location.pathname +
        "?produto=" +
        encodeURIComponent(codigo);

}


// =====================================================
// PRODUTO INDIVIDUAL
// =====================================================
function mostrarProdutoIndividual() {
    
const produto =
    produtos.find(function(item) {

        return (
            gerarCodigoProduto(item.nome) ===
            produtoCodigo
        );

    });


    if (!produto) {

        containerProdutos.innerHTML =
            "<p>Produto não encontrado.</p>";

        return;

    }


    // =================================================
    // MUITO IMPORTANTE:
    // TIRAR O GRID DA PÁGINA INDIVIDUAL
    // =================================================

    containerProdutos.style.display =
        "block";


    containerProdutos.style.gridTemplateColumns =
        "none";


    containerProdutos.innerHTML =
        "";


    // =================================================
    // CARD INDIVIDUAL
    // =================================================

    const div =
        document.createElement("div");


    div.className =
        "produto produto-individual";


    div.style.maxWidth =
        "420px";


    div.style.margin =
        "20px auto";


    // =================================================
    // BOTÃO CONTINUAR COMPRANDO
    // =================================================

    const voltar =
        document.createElement("button");


    voltar.type =
        "button";


    voltar.textContent =
        "← Continuar comprando";


    voltar.addEventListener(
        "click",
        function() {

            window.location.href =
                window.location.pathname;

        }
    );


    voltar.style.marginBottom =
        "20px";


    div.appendChild(
        voltar
    );


    // =================================================
    // FOTO
    // =================================================

    if (produto.foto) {

        const imagem =
            document.createElement("img");


        imagem.src =
            produto.foto;


        imagem.alt =
            produto.nome;


        imagem.style.width =
            "100%";


        imagem.style.maxWidth =
            "380px";


        imagem.style.height =
            "380px";


        imagem.style.objectFit =
            "contain";


        imagem.style.borderRadius =
            "12px";


        imagem.style.display =
            "block";


        imagem.style.margin =
            "0 auto 20px";


        div.appendChild(
            imagem
        );

    }


    // =================================================
    // NOME
    // =================================================

    const titulo =
        document.createElement("h2");


    titulo.textContent =
        produto.nome;


    div.appendChild(
        titulo
    );


    // =================================================
    // PREÇO
    // =================================================

    const preco =
        document.createElement("p");


    preco.innerHTML =
        "<strong>R$ " +
        produto.preco
            .toFixed(2)
            .replace(".", ",") +
        "</strong>";


    div.appendChild(
        preco
    );


    // =================================================
    // DESCRIÇÃO
    // =================================================

    if (produto.descricao) {

        const descricao =
            document.createElement("p");


        descricao.textContent =
            produto.descricao;


        div.appendChild(
            descricao
        );

    }


    // =================================================
    // TAMANHO
    // =================================================

    let selectTamanho =
        null;


    if (
        produto.tamanhos &&
        produto.tamanhos.length > 0
    ) {

        const label =
            document.createElement("strong");


        label.textContent =
            "Escolha o tamanho:";


        label.style.display =
            "block";


        label.style.marginTop =
            "15px";


        div.appendChild(
            label
        );


        selectTamanho =
            document.createElement("select");


        selectTamanho.style.width =
            "100%";


        selectTamanho.style.marginTop =
            "8px";


        const opcaoInicial =
            document.createElement("option");


        opcaoInicial.value =
            "";


        opcaoInicial.textContent =
            "Selecione o tamanho";


        opcaoInicial.disabled =
            true;


        opcaoInicial.selected =
            true;


        selectTamanho.appendChild(
            opcaoInicial
        );


        produto.tamanhos.forEach(
            function(tamanho) {

                const option =
                    document.createElement("option");


                option.value =
                    tamanho;


                option.textContent =
                    tamanho;


                selectTamanho.appendChild(
                    option
                );

            }
        );


        div.appendChild(
            selectTamanho
        );

    }


    // =================================================
    // QUANTIDADE
    // =================================================

    const labelQuantidade =
        document.createElement("strong");


    labelQuantidade.textContent =
        "Quantidade:";


    labelQuantidade.style.display =
        "block";


    labelQuantidade.style.marginTop =
        "15px";


    div.appendChild(
        labelQuantidade
    );


    const quantidade =
        document.createElement("input");


    quantidade.type =
        "number";


    quantidade.min =
        "1";


    quantidade.value =
        "1";


    quantidade.style.width =
        "80px";


    quantidade.style.textAlign =
        "center";


    quantidade.style.margin =
        "8px auto 15px";


    quantidade.style.display =
        "block";


    div.appendChild(
        quantidade
    );


    // =================================================
    // BOTÃO ADICIONAR
    // =================================================

    const botaoAdicionar =
        document.createElement("button");


    botaoAdicionar.type =
        "button";


    botaoAdicionar.textContent =
        "🛒 Adicionar ao carrinho";


    botaoAdicionar.addEventListener(
        "click",
        function() {

            let tamanho =
                "Não informado";


            if (selectTamanho) {

                tamanho =
                    selectTamanho.value;


                if (!tamanho) {

                    alert(
                        "Escolha o tamanho do produto."
                    );

                    selectTamanho.focus();

                    return;

                }

            }


            let quantidadeEscolhida =
                Number(quantidade.value);


            if (
                !Number.isFinite(
                    quantidadeEscolhida
                ) ||
                quantidadeEscolhida < 1
            ) {

                quantidadeEscolhida =
                    1;

            }


            adicionarAoCarrinho(

                produto.nome,

                produto.preco,

                tamanho,

                produto.foto,

                quantidadeEscolhida

            );

        }
    );


    div.appendChild(
        botaoAdicionar
    );


    // =================================================
    // MEU CARRINHO
    // =================================================

    if (botaoCarrinho) {

        botaoCarrinho.style.display =
            "block";


        botaoCarrinho.textContent =
            "🛒 Meu Carrinho";


        div.appendChild(
            botaoCarrinho
        );

    }


    // =================================================
    // COLOCAR CARD NA TELA
    // =================================================

    containerProdutos.appendChild(
        div
    );

}


// =====================================================
// ADICIONAR AO CARRINHO
// =====================================================

function adicionarAoCarrinho(
    nome,
    preco,
    tamanho,
    foto,
    quantidade
) {

    const existente =
        carrinho.find(function(item) {

            return (
                item.nome === nome &&
                item.tamanho === tamanho
            );

        });


    if (existente) {

        existente.quantidade +=
            quantidade;

    }

    else {

        carrinho.push({

            nome:
                nome,

            preco:
                preco,

            tamanho:
                tamanho,

            foto:
                foto,

            quantidade:
                quantidade

        });

    }


    atualizarCarrinho();


    alert(
        "Produto adicionado ao carrinho!"
    );

}


// =====================================================
// ATUALIZAR CARRINHO
// =====================================================

function atualizarCarrinho() {

    const container =
        document.getElementById(
            "itens-carrinho"
        );


    const totalElemento =
        document.getElementById(
            "total-carrinho"
        );


    if (
        !container ||
        !totalElemento
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (carrinho.length === 0) {

        container.innerHTML =
            "<p>Seu carrinho está vazio.</p>";


        totalElemento.textContent =
            "0,00";


        return;

    }


    let total =
        0;


    carrinho.forEach(
        function(item, index) {

            const subtotal =
                item.preco *
                item.quantidade;


            total +=
                subtotal;


            const div =
                document.createElement("div");


            div.className =
                "item-carrinho";


            // FOTO
            if (item.foto) {

                const imagem =
                    document.createElement("img");


                imagem.src =
                    item.foto;


                imagem.alt =
                    item.nome;


                imagem.style.width =
                    "80px";


                imagem.style.height =
                    "80px";


                imagem.style.objectFit =
                    "contain";


                div.appendChild(
                    imagem
                );

            }


            // NOME
            const nome =
                document.createElement("strong");


            nome.textContent =
                item.nome;


            div.appendChild(
                nome
            );


            div.appendChild(
                document.createElement("br")
            );


            // TAMANHO
            div.appendChild(
                document.createTextNode(
                    "Tamanho: " +
                    item.tamanho
                )
            );


            div.appendChild(
                document.createElement("br")
            );


            // PREÇO
            div.appendChild(
                document.createTextNode(
                    "Preço: R$ " +
                    item.preco
                        .toFixed(2)
                        .replace(".", ",")
                )
            );


            div.appendChild(
                document.createElement("br")
            );


            // QUANTIDADE
            div.appendChild(
                document.createTextNode(
                    "Quantidade: "
                )
            );


            // MENOS
            const menos =
                document.createElement("button");


            menos.textContent =
                "−";


            menos.addEventListener(
                "click",
                function() {

                    diminuirQuantidade(index);

                }
            );


            div.appendChild(
                menos
            );


            // QUANTIDADE
            const quantidade =
                document.createElement("span");


            quantidade.textContent =
                " " +
                item.quantidade +
                " ";


            div.appendChild(
                quantidade
            );


            // MAIS
            const mais =
                document.createElement("button");


            mais.textContent =
                "+";


            mais.addEventListener(
                "click",
                function() {

                    aumentarQuantidade(index);

                }
            );


            div.appendChild(
                mais
            );


            // REMOVER
            const remover =
                document.createElement("button");


            remover.textContent =
                "🗑️ Remover";


            remover.addEventListener(
                "click",
                function() {

                    carrinho.splice(
                        index,
                        1
                    );


                    atualizarCarrinho();

                }
            );


            div.appendChild(
                remover
            );


            // SUBTOTAL
            const subtotalTexto =
                document.createElement("p");


            subtotalTexto.textContent =
                "Subtotal: R$ " +
                subtotal
                    .toFixed(2)
                    .replace(".", ",");


            div.appendChild(
                subtotalTexto
            );


            container.appendChild(
                div
            );

        }
    );


    totalElemento.textContent =
        total
            .toFixed(2)
            .replace(".", ",");

}


// =====================================================
// AUMENTAR QUANTIDADE
// =====================================================

function aumentarQuantidade(index) {

    if (!carrinho[index]) {
        return;
    }


    carrinho[index].quantidade++;


    atualizarCarrinho();

}


// =====================================================
// DIMINUIR QUANTIDADE
// =====================================================

function diminuirQuantidade(index) {

    if (!carrinho[index]) {
        return;
    }


    carrinho[index].quantidade--;


    if (
        carrinho[index].quantidade <= 0
    ) {

        carrinho.splice(
            index,
            1
        );

    }


    atualizarCarrinho();

}


// =====================================================
// PRODUTOS → CARRINHO
// =====================================================

if (botaoCarrinho) {

    botaoCarrinho.addEventListener(
        "click",
        function() {

            telaProdutos.style.display =
                "none";


            telaCarrinho.style.display =
                "block";


            telaEntrega.style.display =
                "none";


            window.scrollTo(
                0,
                0
            );

        }
    );

}


// =====================================================
// CARRINHO → PRODUTOS
// =====================================================

if (voltarProdutos) {

    voltarProdutos.addEventListener(
        "click",
        function() {

            telaCarrinho.style.display =
                "none";


            telaEntrega.style.display =
                "none";


            telaProdutos.style.display =
                "block";


            window.scrollTo(
                0,
                0
            );

        }
    );

}


// =====================================================
// CARRINHO → ENTREGA
// =====================================================

if (irEntrega) {

    irEntrega.addEventListener(
        "click",
        function() {

            if (carrinho.length === 0) {

                alert(
                    "Seu carrinho está vazio."
                );

                return;

            }


            telaProdutos.style.display =
                "none";


            telaCarrinho.style.display =
                "none";


            telaEntrega.style.display =
                "block";


            window.scrollTo(
                0,
                0
            );

        }
    );

}


// =====================================================
// ENTREGA → CARRINHO
// =====================================================

if (voltarCarrinho) {

    voltarCarrinho.addEventListener(
        "click",
        function() {

            telaEntrega.style.display =
                "none";


            telaCarrinho.style.display =
                "block";


            window.scrollTo(
                0,
                0
            );

        }
    );

}


// =====================================================
// FINALIZAR PEDIDO - WHATSAPP
// =====================================================

function finalizarPedido() {

    if (carrinho.length === 0) {

        alert(
            "Seu carrinho está vazio."
        );

        return;

    }


    const cliente =
        document
            .getElementById("cliente")
            .value
            .trim();


    const telefone =
        document
            .getElementById("telefone")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const rua =
        document
            .getElementById("rua")
            .value
            .trim();


    const numero =
        document
            .getElementById("numero")
            .value
            .trim();


    const bairro =
        document
            .getElementById("bairro")
            .value
            .trim();


    const cidade =
        document
            .getElementById("cidade")
            .value
            .trim();


    const cep =
        document
            .getElementById("cep")
            .value
            .trim();


    const pagamento =
        document
            .getElementById("pagamento")
            .value
            .trim();


    const observacao =
        document
            .getElementById("observacao")
            .value
            .trim();


    // =================================================
    // OBRIGATÓRIOS
    // =================================================

    if (!cliente) {

        alert(
            "Digite o nome da cliente."
        );

        document
            .getElementById("cliente")
            .focus();

        return;

    }


    if (!rua) {

        alert(
            "Digite a rua."
        );

        document
            .getElementById("rua")
            .focus();

        return;

    }


    if (!numero) {

        alert(
            "Digite o número."
        );

        document
            .getElementById("numero")
            .focus();

        return;

    }


    if (!bairro) {

        alert(
            "Digite o bairro."
        );

        document
            .getElementById("bairro")
            .focus();

        return;

    }


    if (!cidade) {

        alert(
            "Digite a cidade."
        );

        document
            .getElementById("cidade")
            .focus();

        return;

    }


    if (!cep) {

        alert(
            "Digite o CEP."
        );

        document
            .getElementById("cep")
            .focus();

        return;

    }


    // =================================================
    // MENSAGEM WHATSAPP
    // =================================================

    let mensagem =
        "=== NOVO PEDIDO - DABRUALE MODA ÍNTIMA ===\n\n";


    mensagem +=
        "[CLIENTE]\n" +
        cliente +
        "\n";


    if (telefone) {

        mensagem +=
            "Telefone: " +
            telefone +
            "\n";

    }


    if (email) {

        mensagem +=
            "E-mail: " +
            email +
            "\n";

    }


    mensagem +=
        "\n[ENDEREÇO DE ENTREGA]\n" +
        "Rua: " +
        rua +
        "\n" +
        "Número: " +
        numero +
        "\n" +
        "Bairro: " +
        bairro +
        "\n" +
        "Cidade: " +
        cidade +
        "\n" +
        "CEP: " +
        cep +
        "\n\n";


    mensagem +=
        "[PRODUTOS]\n\n";


    carrinho.forEach(
        function(item) {

            const subtotal =
                item.preco *
                item.quantidade;


            mensagem +=
                item.nome +
                "\n" +
                "Tamanho: " +
                item.tamanho +
                "\n" +
                "Quantidade: " +
                item.quantidade +
                "\n" +
                "Subtotal: R$ " +
                subtotal
                    .toFixed(2)
                    .replace(".", ",") +
                "\n\n";

        }
    );


    const total =
        carrinho.reduce(
            function(soma, item) {

                return (
                    soma +
                    item.preco *
                    item.quantidade
                );

            },
            0
        );


    mensagem +=
        "[TOTAL]\n" +
        "R$ " +
        total
            .toFixed(2)
            .replace(".", ",");


    if (pagamento) {

        mensagem +=
            "\nPagamento: " +
            pagamento;

    }


    if (observacao) {

        mensagem +=
            "\nObservação: " +
            observacao;

    }


    // =================================================
    // WHATSAPP
    // =================================================

    const numeroWhatsApp =
        "5565996719068";


    const url =
        "https://api.whatsapp.com/send?phone=" +
        numeroWhatsApp +
        "&text=" +
        encodeURIComponent(
            mensagem
        );


    window.open(
        url,
        "_blank"
    );

}


// =====================================================
// BOTÃO WHATSAPP
// =====================================================

const botaoWhatsApp =
    document.getElementById(
        "finalizar-whatsapp"
    );


if (botaoWhatsApp) {

    botaoWhatsApp.addEventListener(
        "click",
        finalizarPedido
    );

}
