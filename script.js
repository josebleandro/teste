let carrinho = [];

// Elementos do HTML
const contadorHTML = document.getElementById('contador-carrinho');
const listaHTML = document.getElementById('lista-carrinho');
const valorTotalHTML = document.getElementById('valor-total');
const botoesComprar = document.querySelectorAll('.btn-comprar');
const botaoLimpar = document.getElementById('btn-limpar');
const botaoFinalizar = document.getElementById('btn-finalizar');

// Função para atualizar a tela
function atualizarInterfaceCarrinho() {
    contadorHTML.textContent = carrinho.length;
    listaHTML.innerHTML = '';

    if (carrinho.length === 0) {
        listaHTML.classList.add('lista-vazia');
        listaHTML.innerHTML = '<li id="item-vazio">Nenhum produto adicionado ainda.</li>';
        valorTotalHTML.textContent = 'R$ 0,00';
        return;
    }

    listaHTML.classList.remove('lista-vazia');
    let somaTotal = 0;
    
    carrinho.forEach((item, index) => {
        somaTotal += item.preco;

        const li = document.createElement('li');
        const precoFormatado = item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        li.innerHTML = `
            <div>
                <span>📦 ${item.nome}</span>
                <button class="btn-remover-item" onclick="removerItem(${index})">❌</button>
            </div>
            <strong>${precoFormatado}</strong>
        `;
        listaHTML.appendChild(li);
    });

    valorTotalHTML.textContent = somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para remover um único item específico pelo index
function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarInterfaceCarrinho();
}

// Evento: Adicionar Item
botoesComprar.forEach(botao => {
    botao.addEventListener('click', function() {
        const nomeProduto = this.getAttribute('data-nome');
        const precoProduto = parseFloat(this.getAttribute('data-preco'));
        carrinho.push({ nome: nomeProduto, preco: precoProduto });
        atualizarInterfaceCarrinho();
    });
});

// Evento: Limpar Tudo
botaoLimpar.addEventListener('click', function() {
    carrinho = [];
    atualizarInterfaceCarrinho();
});

// Evento: Finalizar Pedido no WhatsApp
botaoFinalizar.addEventListener('click', function() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio! Adicione produtos antes de finalizar.");
        return;
    }

    const numeroTelefone = "5514981791779"; 

    let textoMensagem = "Olá! Gostaria de fazer o pedido dos seguintes itens:\n\n";
    
    carrinho.forEach(item => {
        textoMensagem += `- ${item.nome} (${item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})\n`;
    });
    
    textoMensagem += `\n*Total do Pedido:* ${valorTotalHTML.textContent}`;

    const textoCodificado = encodeURIComponent(textoMensagem);
    const urlWhatsApp = `https://wa.me/${numeroTelefone}?text=${textoCodificado}`;
    window.open(urlWhatsApp, '_blank');
});