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

    // ⚠️ MANTENHA A SUA API KEY ORIGINAL AQUI
    apiKey: "COLE_AQUI_SUA_API_KEY_ORIGINAL",

    authDomain: "dabruale-moda-intima.firebaseapp.com",

    databaseURL:
        "https://dabruale-moda-intima-default-rtdb.firebaseio.com",

    projectId: "dabruale-moda-intima",

    storageBucket:
        "dabruale-moda-intima.firebasestorage.app",

    messagingSenderId:
        "106483648309",

    appId:
        "1:106483648309:web:a1e116f7a2e43d653a2e7c"

};


// Inicializar Firebase
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
// CARREGAR PRODUTOS DO FIREBASE
// =====================================================

const produtosRef = ref(database, "produtos");

onValue(produtosRef, function(snapshot) {

    produtos = [];

    const dados = snapshot.val();

    if (dados) {

        Object.keys(dados).forEach(function(id) {

            const produto = dados[id];

            produtos.push({

                id: id,

                nome:
                    produto.nome || "Produto",

                preco:
                    Number(produto.preco) || 0,

                tamanhos:
                    Array.isArray(produto.tamanhos)
                        ? produto.tamanhos
                        : [],

                estoque:
                    produto.estoque ?? null,

                descricao:
                    produto.descricao || "",

                foto:
                    produto.foto || "",

                ativo:
                    produto.ativo !== false

            });

        });

    }

    mostrarProdutos();
// =====================================================
// ABRIR PRODUTO INDIVIDUAL PELO LINK
// =====================================================

const parametros = new URLSearchParams(window.location.search);
const produtoId = parametros.get("produto");

if (produtoId) {

    const produtoIndividual = produtos.find(function(produto) {
        return produto.id === produtoId;
    });

    if (produtoIndividual) {

        const container = document.getElementById("produtos");

        if (container) {
            container.innerHTML = "";
        }

        const div = document.createElement("div");
        div.className = "produto";

        if (produtoIndividual.foto) {

            const imagem = document.createElement("img");

            imagem.src = produtoIndividual.foto;
            imagem.alt = produtoIndividual.nome;

            imagem.style.width = "100%";
            imagem.style.maxWidth = "300px";
            imagem.style.height = "300px";
            imagem.style.objectFit = "contain";
            imagem.style.borderRadius = "12px";
            imagem.style.display = "block";
            imagem.style.margin = "0 auto 15px";

            div.appendChild(imagem);
        }

        const titulo = document.createElement("h3");
        titulo.textContent = produtoIndividual.nome;
        div.appendChild(titulo);

        const preco = document.createElement("p");

        preco.innerHTML =
            "<strong>R$ " +
            produtoIndividual.preco
                .toFixed(2)
                .replace(".", ",") +
            "</strong>";

        div.appendChild(preco);

        if (produtoIndividual.descricao) {

            const descricao = document.createElement("p");

            descricao.textContent =
                produtoIndividual.descricao;

            div.appendChild(descricao);
        }

        container.appendChild(div);
    }
}
});


// =====================================================
// MOSTRAR PRODUTOS
// =====================================================

function mostrarProdutos() {

    const container =
        document.getElementById("produtos");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const produtosAtivos =
        produtos.filter(function(produto) {

            return produto.ativo !== false;

        });


    if (produtosAtivos.length === 0) {

        container.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;
    }


    produtosAtivos.forEach(function(produto, index) {

        const div =
            document.createElement("div");

        div.className = "produto";


        // =================================================
        // FOTO DO PRODUTO
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
        // TAMANHOS
        // =================================================

        if (
            produto.tamanhos &&
            produto.tamanhos.length > 0
        ) {

            const select =
                document.createElement("select");

            select.id =
                "tamanho-produto-" + index;


            produto.tamanhos.forEach(
                function(tamanho) {

                    const option =
                        document.createElement("option");

                    option.value =
                        tamanho;

                    option.textContent =
                        tamanho;

                    select.appendChild(option);

                }
            );


            div.appendChild(select);

        } else {

            const tamanho =
                document.createElement("p");

            tamanho.textContent =
                "Tamanho: Não informado";

            div.appendChild(tamanho);

        }


        // =================================================
        // BOTÃO ADICIONAR AO CARRINHO
        // =================================================

        const botao =
            document.createElement("button");

        botao.textContent =
            "🛒 Adicionar ao carrinho";


        botao.addEventListener(
            "click",
            function() {

                adicionarProduto(index);

            }
        );


        div.appendChild(botao);


        // Adicionar produto à tela
        container.appendChild(div);

    });

}


// =====================================================
// ADICIONAR PRODUTO
// =====================================================

function adicionarProduto(index) {

    const produtosAtivos =
        produtos.filter(function(produto) {

            return produto.ativo !== false;

        });


    const produto =
        produtosAtivos[index];


    if (!produto) {
        return;
    }


    let tamanho =
        "Não informado";


    if (
        produto.tamanhos &&
        produto.tamanhos.length > 0
    ) {

        const select =
            document.getElementById(
                "tamanho-produto-" + index
            );


        if (select) {

            tamanho =
                select.value;

        }

    }


    adicionarAoCarrinho(

        produto.nome,

        produto.preco,

        tamanho,

        produto.foto

    );

}


// =====================================================
// ADICIONAR AO CARRINHO
// =====================================================

function adicionarAoCarrinho(
    nome,
    preco,
    tamanho,
    foto
) {

    const existente =
        carrinho.find(function(item) {

            return (
                item.nome === nome &&
                item.tamanho === tamanho
            );

        });


    if (existente) {

        existente.quantidade++;

    } else {

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
                1

        });

    }


    atualizarCarrinho();

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


    if (!container || !totalElemento) {
        return;
    }


    container.innerHTML = "";


    if (carrinho.length === 0) {

        container.innerHTML =
            "<p>Seu carrinho está vazio.</p>";


        totalElemento.textContent =
            "0,00";


        return;
    }


    let total = 0;


    carrinho.forEach(function(item, index) {

        const subtotal =
            item.preco *
            item.quantidade;


        total += subtotal;


        const div =
            document.createElement("div");


        div.className =
            "item-carrinho";


        // =================================================
        // FOTO DO PRODUTO NO CARRINHO
        // =================================================

        if (item.foto) {

            const imagemCarrinho =
                document.createElement("img");


            imagemCarrinho.src =
                item.foto;


            imagemCarrinho.alt =
                item.nome;


            imagemCarrinho.style.width =
                "80px";


            imagemCarrinho.style.height =
                "80px";


            imagemCarrinho.style.objectFit =
                "contain";


            imagemCarrinho.style.borderRadius =
                "8px";


            imagemCarrinho.style.display =
                "block";


            imagemCarrinho.style.marginBottom =
                "10px";


            div.appendChild(
                imagemCarrinho
            );

        }


        // =================================================
        // NOME
        // =================================================

        const nome =
            document.createElement("strong");

        nome.textContent =
            item.nome;

        div.appendChild(nome);


        div.appendChild(
            document.createElement("br")
        );


        // =================================================
        // TAMANHO
        // =================================================

        const tamanhoTexto =
            document.createTextNode(
                "Tamanho: " +
                item.tamanho
            );

        div.appendChild(
            tamanhoTexto
        );


        div.appendChild(
            document.createElement("br")
        );


        // =================================================
        // PREÇO
        // =================================================

        const precoTexto =
            document.createTextNode(
                "R$ " +
                item.preco
                    .toFixed(2)
                    .replace(".", ",")
            );

        div.appendChild(
            precoTexto
        );


        div.appendChild(
            document.createElement("br")
        );


        div.appendChild(
            document.createTextNode("Quantidade: ")
        );


        // =================================================
        // BOTÃO MENOS
        // =================================================

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


        div.appendChild(menos);


        // =================================================
        // QUANTIDADE
        // =================================================

        const quantidade =
            document.createElement("span");

        quantidade.textContent =
            " " +
            item.quantidade +
            " ";


        div.appendChild(
            quantidade
        );


        // =================================================
        // BOTÃO MAIS
        // =================================================

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


        div.appendChild(mais);


        // =================================================
        // BOTÃO REMOVER
        // =================================================

        div.appendChild(
            document.createTextNode(" ")
        );


        const remover =
            document.createElement("button");


        remover.textContent =
            "🗑️ Remover";


        remover.addEventListener(
            "click",
            function() {

                carrinho.splice(index, 1);

                atualizarCarrinho();

            }
        );


        div.appendChild(
            remover
        );


        // =================================================
        // SUBTOTAL
        // =================================================

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


        // =================================================
        // COLOCAR NO CARRINHO
        // =================================================

        container.appendChild(
            div
        );

    });


    // =================================================
    // TOTAL
    // =================================================

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

        carrinho.splice(index, 1);

    }


    atualizarCarrinho();

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


    // =================================================
    // DADOS DA CLIENTE
    // =================================================

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
    // CAMPOS OBRIGATÓRIOS
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
    // MONTAR MENSAGEM
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


    // =================================================
    // PRODUTOS DO PEDIDO
    // =================================================

    carrinho.forEach(function(item) {

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

    });


    // =================================================
    // TOTAL
    // =================================================

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


    // =================================================
    // PAGAMENTO
    // =================================================

    if (pagamento) {

        mensagem +=
            "\nPagamento: " +
            pagamento;

    }


    // =================================================
    // OBSERVAÇÃO
    // =================================================

    if (observacao) {

        mensagem +=
            "\nObservação: " +
            observacao;

    }


    // =================================================
    // ABRIR WHATSAPP
    // =================================================

    const numeroWhatsApp =
        "5565996719068";


    const url =
        "https://api.whatsapp.com/send?phone=" +
        numeroWhatsApp +
        "&text=" +
        encodeURIComponent(mensagem);


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
