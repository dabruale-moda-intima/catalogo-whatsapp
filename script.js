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

    // ⚠️ COLOQUE AQUI A SUA API KEY ORIGINAL
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


    // =================================================
    // VERIFICAR SE É PÁGINA INDIVIDUAL
    // =================================================

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const produtoId =
        parametros.get("produto");


    if (produtoId) {

        mostrarProdutoIndividual(produtoId);

    } else {

        mostrarProdutos();

    }

});


// =====================================================
// MOSTRAR TODOS OS PRODUTOS
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
        // TAMANHO
        // =================================================

        if (
            produto.tamanhos &&
            produto.tamanhos.length > 0
        ) {

            const select =
                document.createElement("select");


            select.id =
                "tamanho-produto-" + index;


            // opção inicial

            const primeiraOpcao =
                document.createElement("option");


            primeiraOpcao.value =
                "";


            primeiraOpcao.textContent =
                "Escolha o tamanho";


            primeiraOpcao.disabled =
                true;


            primeiraOpcao.selected =
                true;


            select.appendChild(
                primeiraOpcao
            );


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

        }


        // =================================================
        // BOTÃO ADICIONAR
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


        // =================================================
        // BOTÃO VER PRODUTO
        // =================================================

        const verProduto =
            document.createElement("button");


        verProduto.textContent =
            "👙 Ver produto";


        verProduto.style.marginTop =
            "8px";


        verProduto.addEventListener(
            "click",
            function() {

                window.location.href =
                    "?produto=" +
                    encodeURIComponent(
                        produto.id
                    );

            }
        );


        div.appendChild(verProduto);


        container.appendChild(div);

    });

}


// =====================================================
// MOSTRAR PRODUTO INDIVIDUAL
// =====================================================

function mostrarProdutoIndividual(produtoId) {

    const container =
        document.getElementById("produtos");


    if (!container) {
        return;
    }


    const produto =
        produtos.find(function(item) {

            return item.id === produtoId;

        });


    // =================================================
    // PRODUTO NÃO ENCONTRADO
    // =================================================

    if (!produto) {

        container.innerHTML =
            "<p>Produto não encontrado.</p>";


        criarBotaoContinuarComprando(
            container
        );


        return;

    }


    if (produto.ativo === false) {

        container.innerHTML =
            "<p>Este produto não está disponível.</p>";


        criarBotaoContinuarComprando(
            container
        );


        return;

    }


    // =================================================
    // LIMPAR
    // =================================================

    container.innerHTML = "";


    // =================================================
    // BOTÃO VOLTAR
    // =================================================

    const voltar =
        document.createElement("button");


    voltar.textContent =
        "← Voltar para Todos os Produtos";


    voltar.type =
        "button";


    voltar.addEventListener(
        "click",
        function() {

            window.location.href =
                window.location.pathname;

        }
    );


    container.appendChild(voltar);


    // =================================================
    // DIV DO PRODUTO
    // =================================================

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


        imagem.style.width =
            "100%";


        imagem.style.maxWidth =
            "400px";


        imagem.style.height =
            "400px";


        imagem.style.objectFit =
            "contain";


        imagem.style.borderRadius =
            "12px";


        imagem.style.display =
            "block";


        imagem.style.margin =
            "20px auto";


        div.appendChild(imagem);

    }


    // =================================================
    // NOME
    // =================================================

    const titulo =
        document.createElement("h2");


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

    let selectTamanho = null;


    if (
        produto.tamanhos &&
        produto.tamanhos.length > 0
    ) {

        const label =
            document.createElement("label");


        label.textContent =
            "Escolha o tamanho:";


        label.style.display =
            "block";


        label.style.marginTop =
            "15px";


        label.style.fontWeight =
            "bold";


        div.appendChild(label);


        selectTamanho =
            document.createElement("select");


        selectTamanho.id =
            "tamanho-produto-individual";


        selectTamanho.style.display =
            "block";


        selectTamanho.style.margin =
            "8px auto";


        const primeiraOpcao =
            document.createElement("option");


        primeiraOpcao.value =
            "";


        primeiraOpcao.textContent =
            "Selecione o tamanho";


        primeiraOpcao.disabled =
            true;


        primeiraOpcao.selected =
            true;


        selectTamanho.appendChild(
            primeiraOpcao
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

    } else {

        const semTamanho =
            document.createElement("p");


        semTamanho.textContent =
            "Tamanho: Não informado";


        div.appendChild(
            semTamanho
        );

    }


    // =================================================
    // QUANTIDADE
    // =================================================

    const labelQuantidade =
        document.createElement("label");


    labelQuantidade.textContent =
        "Quantidade:";


    labelQuantidade.style.display =
        "block";


    labelQuantidade.style.marginTop =
        "15px";


    labelQuantidade.style.fontWeight =
        "bold";


    div.appendChild(
        labelQuantidade
    );


    const quantidade =
        document.createElement("input");


    quantidade.type =
        "number";


    quantidade.id =
        "quantidade-produto-individual";


    quantidade.min =
        "1";


    quantidade.value =
        "1";


    quantidade.style.width =
        "80px";


    quantidade.style.textAlign =
        "center";


    quantidade.style.margin =
        "8px 0";


    div.appendChild(
        quantidade
    );


    // =================================================
    // BOTÃO ADICIONAR AO CARRINHO
    // =================================================

    const botao =
        document.createElement("button");


    botao.textContent =
        "🛒 Adicionar ao carrinho";


    botao.type =
        "button";


    botao.addEventListener(
        "click",
        function() {

            let tamanho =
                "Não informado";


            if (selectTamanho) {

                if (!selectTamanho.value) {

                    alert(
                        "Escolha o tamanho do produto."
                    );


                    selectTamanho.focus();


                    return;

                }


                tamanho =
                    selectTamanho.value;

            }


            let quantidadeEscolhida =
                parseInt(
                    quantidade.value,
                    10
                );


            if (
                isNaN(
                    quantidadeEscolhida
                ) ||
                quantidadeEscolhida < 1
            ) {

                quantidadeEscolhida =
                    1;

            }


            for (
                let i = 0;
                i < quantidadeEscolhida;
                i++
            ) {

                adicionarAoCarrinho(

                    produto.nome,

                    produto.preco,

                    tamanho,

                    produto.foto

                );

            }


            alert(
                "Produto adicionado ao carrinho!"
            );

        }
    );


    div.appendChild(botao);


    // =================================================
    // BOTÃO MEU CARRINHO
    // =================================================

    const botaoCarrinho =
        document.createElement("button");


    botaoCarrinho.textContent =
        "🛒 Meu Carrinho";


    botaoCarrinho.type =
        "button";


    botaoCarrinho.style.marginTop =
        "10px";


    botaoCarrinho.addEventListener(
        "click",
        function() {

            const telaProdutos =
                document.getElementById(
                    "tela-produtos"
                );


            const telaCarrinho =
                document.getElementById(
                    "tela-carrinho"
                );


            if (
                telaProdutos &&
                telaCarrinho
            ) {

                telaProdutos.style.display =
                    "none";


                telaCarrinho.style.display =
                    "block";


                window.scrollTo(
                    0,
                    0
                );

            }

        }
    );


    div.appendChild(
        botaoCarrinho
    );


    // =================================================
    // COLOCAR PRODUTO NA TELA
    // =================================================

    container.appendChild(div);


    // =================================================
    // CONTINUAR COMPRANDO
    // =================================================

    criarBotaoContinuarComprando(
        container
    );

}


// =====================================================
// BOTÃO CONTINUAR COMPRANDO
// =====================================================

function criarBotaoContinuarComprando(
    container
) {

    const botao =
        document.createElement("button");


    botao.textContent =
        "← Continuar comprando";


    botao.type =
        "button";


    botao.style.marginTop =
        "15px";


    botao.addEventListener(
        "click",
        function() {

            window.location.href =
                window.location.pathname;

        }
    );


    container.appendChild(
        botao
    );

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


        if (!select || !select.value) {

            alert(
                "Escolha o tamanho do produto."
            );


            return;

        }


        tamanho =
            select.value;

    }


    adicionarAoCarrinho(

        produto.nome,

        produto.preco,

        tamanho,

        produto.foto

    );


    alert(
        "Produto adicionado ao carrinho!"
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


    if (
        !container ||
        !totalElemento
    ) {

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


    carrinho.forEach(
        function(item, index) {

            const subtotal =
                item.preco *
                item.quantidade;


            total += subtotal;


            const div =
                document.createElement("div");


            div.className =
                "item-carrinho";


            // =================================================
            // FOTO
            // =================================================

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


                imagem.style.borderRadius =
                    "8px";


                imagem.style.display =
                    "block";


                imagem.style.marginBottom =
                    "10px";


                div.appendChild(
                    imagem
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

            div.appendChild(
                document.createTextNode(
                    "Tamanho: " +
                    item.tamanho
                )
            );


            div.appendChild(
                document.createElement("br")
            );


            // =================================================
            // PREÇO
            // =================================================

            div.appendChild(
                document.createTextNode(
                    "R$ " +
                    item.preco
                        .toFixed(2)
                        .replace(".", ",")
                )
            );


            div.appendChild(
                document.createElement("br")
            );


            // =================================================
            // QUANTIDADE
            // =================================================

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


            menos.type =
                "button";


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


            mais.type =
                "button";


            mais.addEventListener(
                "click",
                function() {

                    aumentarQuantidade(index);

                }
            );


            div.appendChild(
                mais
            );


            // =================================================
            // REMOVER
            // =================================================

            div.appendChild(
                document.createTextNode(" ")
            );


            const remover =
                document.createElement("button");


            remover.textContent =
                "🗑️ Remover";


            remover.type =
                "button";


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


            container.appendChild(
                div
            );

        }
    );


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

        carrinho.splice(
            index,
            1
        );

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
    // PRODUTOS
    // =================================================

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


// =====================================================
// BOTÃO "MEU CARRINHO" DA PÁGINA PRINCIPAL
// =====================================================

const abrirCarrinho =
    document.getElementById(
        "abrir-carrinho"
    );


const telaProdutos =
    document.getElementById(
        "tela-produtos"
    );


const telaCarrinho =
    document.getElementById(
        "tela-carrinho"
    );


const telaEntrega =
    document.getElementById(
        "tela-entrega"
    );


if (
    abrirCarrinho &&
    telaProdutos &&
    telaCarrinho
) {

    abrirCarrinho.addEventListener(
        "click",
        function() {

            telaProdutos.style.display =
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
// CARRINHO → PRODUTOS
// =====================================================

const voltarProdutos =
    document.getElementById(
        "voltar-produtos"
    );


if (
    voltarProdutos &&
    telaProdutos &&
    telaCarrinho
) {

    voltarProdutos.addEventListener(
        "click",
        function() {

            telaCarrinho.style.display =
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

const irEntrega =
    document.getElementById(
        "ir-entrega"
    );


if (
    irEntrega &&
    telaCarrinho &&
    telaEntrega
) {

    irEntrega.addEventListener(
        "click",
        function() {

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

const voltarCarrinho =
    document.getElementById(
        "voltar-carrinho"
    );


if (
    voltarCarrinho &&
    telaCarrinho &&
    telaEntrega
) {

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
// INICIALIZAR CARRINHO
// =====================================================

atualizarCarrinho();
