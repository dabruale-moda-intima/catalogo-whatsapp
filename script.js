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
    apiKey: "AIzaSyCtNeIuSYRRP8xSgfda0KXHpuZwNtLrN7g",
    authDomain: "dabruale-moda-intima.firebaseapp.com",
    databaseURL: "https://dabruale-moda-intima-default-rtdb.firebaseio.com",
    projectId: "dabruale-moda-intima",
    storageBucket: "dabruale-moda-intima.firebasestorage.app",
    messagingSenderId: "106483648309",
    appId: "1:106483648309:web:a1e116f7a2e43d653a2e7c"
};


// =====================================================
// INICIAR FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// =====================================================
// ESTADOS DA APLICAÇÃO
// =====================================================

const carrinho = [];
let produtos = [];
let categoriaAtual = "Todos";


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const containerProdutos = document.getElementById("produtos");
const botaoCarrinho = document.getElementById("abrir-carrinho");
const telaProdutos = document.getElementById("tela-produtos");
const telaCarrinho = document.getElementById("tela-carrinho");
const telaEntrega = document.getElementById("tela-entrega");
const voltarProdutos = document.getElementById("voltar-produtos");
const irEntrega = document.getElementById("ir-entrega");
const voltarCarrinho = document.getElementById("voltar-carrinho");
const botaoFinalizar = document.getElementById("finalizar-whatsapp");


// =====================================================
// URL DO PRODUTO INDIVIDUAL
// =====================================================

const parametros = new URLSearchParams(window.location.search);
const produtoId = parametros.get("produto");


// =====================================================
// NORMALIZAÇÃO DE TEXTO E FILTRO DE CATEGORIAS
// =====================================================

function produtoPertenceCategoria(catProduto, catFiltro) {
    if (!catFiltro || catFiltro === "Todos") return true;

    const prod = String(catProduto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const filtro = String(catFiltro || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    // Remove 's' do final para igualar singular e plural (ex: biquini / biquinis)
    const prodBase = prod.endsWith("s") ? prod.slice(0, -1) : prod;
    const filtroBase = filtro.endsWith("s") ? filtro.slice(0, -1) : filtro;

    return (
        prod === filtro ||
        prodBase === filtroBase ||
        prod.includes(filtro) ||
        filtro.includes(prod) ||
        prodBase.includes(filtroBase)
    );
}

function configurarBotoesCategorias() {
    const botoes = document.querySelectorAll(".btn-categoria");
    botoes.forEach(function(botao) {
        botao.addEventListener("click", function() {
            botoes.forEach(b => b.classList.remove("ativo"));
            this.classList.add("ativo");
            categoriaAtual = this.getAttribute("data-categoria") || "Todos";
            mostrarTodosProdutos();
        });
    });
}


// =====================================================
// GERAR CÓDIGO DO PRODUTO PARA O LINK
// =====================================================

function gerarCodigoProduto(nome) {
    return String(nome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}


// =====================================================
// ABRIR PRODUTO INDIVIDUAL
// =====================================================

function abrirProduto(nome) {
    const codigo = gerarCodigoProduto(nome);
    window.location.href = window.location.pathname + "?produto=" + encodeURIComponent(codigo);
}


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

            // Tamanhos
            let tamanhos = [];
            if (Array.isArray(produto.tamanhos)) {
                tamanhos = produto.tamanhos.filter(function(tamanho) {
                    return (
                        tamanho !== null &&
                        tamanho !== undefined &&
                        String(tamanho).trim() !== ""
                    );
                });
            } else if (produto.tamanhos && typeof produto.tamanhos === "object") {
                tamanhos = Object.values(produto.tamanhos).filter(function(tamanho) {
                    return (
                        tamanho !== null &&
                        tamanho !== undefined &&
                        String(tamanho).trim() !== ""
                    );
                });
            }

            // Produto
            produtos.push({
                id: id,
                nome: produto.nome || "Produto",
                categoria: produto.categoria || "",
                preco: Number(produto.preco) || 0,
                tamanhos: tamanhos,
                estoque: produto.estoque ?? null,
                descricao: produto.descricao || "",
                foto: produto.foto || "",
                ativo: produto.ativo !== false
            });
        });
    }

    mostrarPagina();
});


// =====================================================
// MOSTRAR PÁGINA
// =====================================================

function mostrarPagina() {
    configurarBotoesCategorias();

    if (produtoId) {
        mostrarProdutoIndividual();
    } else {
        mostrarTodosProdutos();
    }
}


// =====================================================
// TODOS OS PRODUTOS
// =====================================================

function mostrarTodosProdutos() {
    if (!containerProdutos) return;

    containerProdutos.style.display = "grid";
    containerProdutos.style.gridTemplateColumns = "";
    containerProdutos.style.gridColumn = "";
    containerProdutos.innerHTML = "";

    // Filtra por ativos e pela categoria selecionada
    const produtosFiltrados = produtos.filter(function(produto) {
        const estaAtivo = produto.ativo !== false;
        const pertenceCategoria = produtoPertenceCategoria(produto.categoria, categoriaAtual);
        return estaAtivo && pertenceCategoria;
    });

    if (produtosFiltrados.length === 0) {
        containerProdutos.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }

    produtosFiltrados.forEach(function(produto, index) {
        const div = document.createElement("div");
        div.className = "produto";

        // Foto
        if (produto.foto) {
            const imagem = document.createElement("img");
            imagem.src = produto.foto;
            imagem.alt = produto.nome;
            imagem.style.cursor = "pointer";
            imagem.addEventListener("click", function() {
                abrirProduto(produto.nome);
            });
            imagem.style.width = "100%";
            imagem.style.maxWidth = "300px";
            imagem.style.height = "300px";
            imagem.style.objectFit = "contain";
            imagem.style.borderRadius = "12px";
            imagem.style.display = "block";
            imagem.style.margin = "0 auto 15px";
            div.appendChild(imagem);
        }

        // Nome
        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;
        titulo.style.cursor = "pointer";
        titulo.addEventListener("click", function() {
            abrirProduto(produto.nome);
        });
        div.appendChild(titulo);

        // Preço
        const preco = document.createElement("p");
        preco.innerHTML = "<strong>R$ " + produto.preco.toFixed(2).replace(".", ",") + "</strong>";
        div.appendChild(preco);

        // Descrição
        if (produto.descricao) {
            const descricao = document.createElement("p");
            descricao.textContent = produto.descricao;
            div.appendChild(descricao);
        }

        // Tamanho
        let selectTamanho = null;
        if (produto.tamanhos && produto.tamanhos.length > 0) {
            selectTamanho = document.createElement("select");
            selectTamanho.id = "tamanho-produto-" + index;

            const opcaoInicial = document.createElement("option");
            opcaoInicial.value = "";
            opcaoInicial.textContent = "Escolha o tamanho";
            opcaoInicial.disabled = true;
            opcaoInicial.selected = true;
            selectTamanho.appendChild(opcaoInicial);

            produto.tamanhos.forEach(function(tamanho) {
                const option = document.createElement("option");
                option.value = tamanho;
                option.textContent = tamanho;
                selectTamanho.appendChild(option);
            });

            div.appendChild(selectTamanho);
        }

        // Botão Adicionar
        const botaoAdicionar = document.createElement("button");
        botaoAdicionar.type = "button";
        botaoAdicionar.textContent = "🛒 Adicionar ao carrinho";

        botaoAdicionar.addEventListener("click", function() {
            let tamanho = "Não informado";

            if (selectTamanho) {
                tamanho = selectTamanho.value;
                if (!tamanho) {
                    alert("Escolha o tamanho do produto.");
                    selectTamanho.focus();
                    return;
                }
            }

            adicionarAoCarrinho(produto.nome, produto.preco, tamanho, produto.foto, 1);
        });

        div.appendChild(botaoAdicionar);
        containerProdutos.appendChild(div);
    });

    if (botaoCarrinho) {
        botaoCarrinho.style.display = "block";
        botaoCarrinho.textContent = "🛒 Meu Carrinho";
        telaProdutos.appendChild(botaoCarrinho);
    }
}


// =====================================================
// PRODUTO INDIVIDUAL
// =====================================================

function mostrarProdutoIndividual() {
    if (!containerProdutos) return;

    const produto = produtos.find(function(item) {
        return (
            item.id === produtoId ||
            gerarCodigoProduto(item.nome) === produtoId
        );
    });

    if (!produto) {
        containerProdutos.innerHTML = "<p>Produto não encontrado.</p>";
        return;
    }

    containerProdutos.style.display = "block";
    containerProdutos.style.gridTemplateColumns = "none";
    containerProdutos.innerHTML = "";

    const div = document.createElement("div");
    div.className = "produto produto-individual";
    div.style.maxWidth = "420px";
    div.style.margin = "20px auto";

    // Botão Voltar
    const voltar = document.createElement("button");
    voltar.type = "button";
    voltar.textContent = "← Continuar comprando";
    voltar.addEventListener("click", function() {
        window.location.href = window.location.pathname;
    });
    voltar.style.marginBottom = "20px";
    div.appendChild(voltar);

    // Foto
    if (produto.foto) {
        const imagem = document.createElement("img");
        imagem.src = produto.foto;
        imagem.alt = produto.nome;
        imagem.style.width = "100%";
        imagem.style.maxWidth = "380px";
        imagem.style.height = "380px";
        imagem.style.objectFit = "contain";
        imagem.style.borderRadius = "12px";
        imagem.style.display = "block";
        imagem.style.margin = "0 auto 20px";
        div.appendChild(imagem);
    }

    // Nome
    const titulo = document.createElement("h2");
    titulo.textContent = produto.nome;
    div.appendChild(titulo);

    // Preço
    const preco = document.createElement("p");
    preco.innerHTML = "<strong>R$ " + produto.preco.toFixed(2).replace(".", ",") + "</strong>";
    div.appendChild(preco);

    // Descrição
    if (produto.descricao) {
        const descricao = document.createElement("p");
        descricao.textContent = produto.descricao;
        div.appendChild(descricao);
    }

    // Tamanho
    let selectTamanho = null;
    if (produto.tamanhos && produto.tamanhos.length > 0) {
        const label = document.createElement("strong");
        label.textContent = "Escolha o tamanho:";
        label.style.display = "block";
        label.style.marginTop = "15px";
        div.appendChild(label);

        selectTamanho = document.createElement("select");
        selectTamanho.style.width = "100%";
        selectTamanho.style.marginTop = "8px";

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione o tamanho";
        opcaoInicial.disabled = true;
        opcaoInicial.selected = true;
        selectTamanho.appendChild(opcaoInicial);

        produto.tamanhos.forEach(function(tamanho) {
            const option = document.createElement("option");
            option.value = tamanho;
            option.textContent = tamanho;
            selectTamanho.appendChild(option);
        });

        div.appendChild(selectTamanho);
    }

    // Quantidade
    const labelQuantidade = document.createElement("strong");
    labelQuantidade.textContent = "Quantidade:";
    labelQuantidade.style.display = "block";
    labelQuantidade.style.marginTop = "15px";
    div.appendChild(labelQuantidade);

    const quantidade = document.createElement("input");
    quantidade.type = "number";
    quantidade.min = "1";
    quantidade.value = "1";
    quantidade.style.width = "80px";
    quantidade.style.textAlign = "center";
    quantidade.style.margin = "8px auto 15px";
    quantidade.style.display = "block";
    div.appendChild(quantidade);

    // Botão Adicionar
    const botaoAdicionar = document.createElement("button");
    botaoAdicionar.type = "button";
    botaoAdicionar.textContent = "🛒 Adicionar ao carrinho";

    botaoAdicionar.addEventListener("click", function() {
        let tamanho = "Não informado";

        if (selectTamanho) {
            tamanho = selectTamanho.value;
            if (!tamanho) {
                alert("Escolha o tamanho do produto.");
                selectTamanho.focus();
                return;
            }
        }

        let quantidadeEscolhida = Number(quantidade.value);
        if (!Number.isFinite(quantidadeEscolhida) || quantidadeEscolhida < 1) {
            quantidadeEscolhida = 1;
        }

        adicionarAoCarrinho(produto.nome, produto.preco, tamanho, produto.foto, quantidadeEscolhida);
    });

    div.appendChild(botaoAdicionar);

    if (botaoCarrinho) {
        botaoCarrinho.style.display = "block";
        botaoCarrinho.textContent = "🛒 Meu Carrinho";
        div.appendChild(botaoCarrinho);
    }

    containerProdutos.appendChild(div);
}


// =====================================================
// ADICIONAR AO CARRINHO
// =====================================================

function adicionarAoCarrinho(nome, preco, tamanho, foto, quantidade) {
    const existente = carrinho.find(function(item) {
        return item.nome === nome && item.tamanho === tamanho;
    });

    if (existente) {
        existente.quantidade += quantidade;
    } else {
        carrinho.push({
            nome: nome,
            preco: preco,
            tamanho: tamanho,
            foto: foto,
            quantidade: quantidade
        });
    }

    atualizarCarrinho();
    alert("Produto adicionado ao carrinho!");
}


// =====================================================
// ATUALIZAR CARRINHO
// =====================================================

function atualizarCarrinho() {
    const container = document.getElementById("itens-carrinho");
    const totalElemento = document.getElementById("total-carrinho");

    if (!container || !totalElemento) return;

    container.innerHTML = "";

    if (carrinho.length === 0) {
        container.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalElemento.textContent = "0,00";
        return;
    }

    let total = 0;

    carrinho.forEach(function(item, index) {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const div = document.createElement("div");
        div.className = "item-carrinho";

        if (item.foto) {
            const imagem = document.createElement("img");
            imagem.src = item.foto;
            imagem.alt = item.nome;
            imagem.style.width = "80px";
            imagem.style.height = "80px";
            imagem.style.objectFit = "contain";
            div.appendChild(imagem);
        }

        const nome = document.createElement("strong");
        nome.textContent = item.nome;
        div.appendChild(nome);

        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("Tamanho: " + item.tamanho));
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("Preço: R$ " + item.preco.toFixed(2).replace(".", ",")));
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("Quantidade: "));

        const menos = document.createElement("button");
        menos.textContent = "−";
        menos.addEventListener("click", function() {
            diminuirQuantidade(index);
        });
        div.appendChild(menos);

        const quantidadeSpan = document.createElement("span");
        quantidadeSpan.textContent = " " + item.quantidade + " ";
        div.appendChild(quantidadeSpan);

        const mais = document.createElement("button");
        mais.textContent = "+";
        mais.addEventListener("click", function() {
            aumentarQuantidade(index);
        });
        div.appendChild(mais);

        const remover = document.createElement("button");
        remover.textContent = "🗑️ Remover";
        remover.addEventListener("click", function() {
            carrinho.splice(index, 1);
            atualizarCarrinho();
        });
        div.appendChild(remover);

        const subtotalTexto = document.createElement("p");
        subtotalTexto.textContent = "Subtotal: R$ " + subtotal.toFixed(2).replace(".", ",");
        div.appendChild(subtotalTexto);

        container.appendChild(div);
    });

    totalElemento.textContent = total.toFixed(2).replace(".", ",");
}


// =====================================================
// QUANTIDADE CARRINHO
// =====================================================

function aumentarQuantidade(index) {
    if (!carrinho[index]) return;
    carrinho[index].quantidade++;
    atualizarCarrinho();
}

function diminuirQuantidade(index) {
    if (!carrinho[index]) return;
    carrinho[index].quantidade--;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    atualizarCarrinho();
}


// =====================================================
// NAVEGAÇÃO ENTRE TELAS
// =====================================================

if (botaoCarrinho) {
    botaoCarrinho.addEventListener("click", function() {
        telaProdutos.style.display = "none";
        telaCarrinho.style.display = "block";
        telaEntrega.style.display = "none";
        window.scrollTo(0, 0);
    });
}

if (voltarProdutos) {
    voltarProdutos.addEventListener("click", function() {
        telaCarrinho.style.display = "none";
        telaEntrega.style.display = "none";
        telaProdutos.style.display = "block";
        window.scrollTo(0, 0);
    });
}

if (irEntrega) {
    irEntrega.addEventListener("click", function() {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }
        telaProdutos.style.display = "none";
        telaCarrinho.style.display = "none";
        telaEntrega.style.display = "block";
        window.scrollTo(0, 0);
    });
}

if (voltarCarrinho) {
    voltarCarrinho.addEventListener("click", function() {
        telaEntrega.style.display = "none";
        telaCarrinho.style.display = "block";
        window.scrollTo(0, 0);
    });
}


// =====================================================
// FINALIZAR PEDIDO - WHATSAPP
// =====================================================

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const cliente = document.getElementById("cliente").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const pagamento = document.getElementById("pagamento").value.trim();
    const observacao = document.getElementById("observacao").value.trim();

    if (!cliente) {
        alert("Digite o nome da cliente.");
        document.getElementById("cliente").focus();
        return;
    }

    if (!rua) {
        alert("Digite a rua.");
        document.getElementById("rua").focus();
        return;
    }

    if (!numero) {
        alert("Digite o número.");
        document.getElementById("numero").focus();
        return;
    }

    if (!bairro) {
        alert("Digite o bairro.");
        document.getElementById("bairro").focus();
        return;
    }

    if (!cidade) {
        alert("Digite a cidade.");
        document.getElementById("cidade").focus();
        return;
    }

    if (!cep) {
        alert("Digite o CEP.");
        document.getElementById("cep").focus();
        return;
    }

    // Montar mensagem para o WhatsApp
    let texto = `*NOVO PEDIDO - DABRUALE MODA ÍNTIMA*\n\n`;
    texto += `*Cliente:* ${cliente}\n`;
    if (telefone) texto += `*Telefone:* ${telefone}\n`;
    if (email) texto += `*E-mail:* ${email}\n`;
    texto += `*Endereço:* ${rua}, Nº ${numero} - ${bairro}, ${cidade} (CEP: ${cep})\n`;
    if (pagamento) texto += `*Pagamento:* ${pagamento}\n`;
    if (observacao) texto += `*Observação:* ${observacao}\n`;

    texto += `\n*ITENS DO PEDIDO:*\n`;

    let total = 0;
    carrinho.forEach(item => {
        const sub = item.preco * item.quantidade;
        total += sub;
        texto += `- ${item.quantidade}x ${item.nome} (${item.tamanho}) - R$ ${sub.toFixed(2).replace(".", ",")}\n`;
    });

    texto += `\n*TOTAL:* R$ ${total.toFixed(2).replace(".", ",")}`;

    const numeroWhatsApp = "5500000000000"; // INSIRA SEU NÚMERO COM DDD AQUI (Ex: 5511999999999)
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
}

if (botaoFinalizar) {
    botaoFinalizar.addEventListener("click", finalizarPedido);
}
