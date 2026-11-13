let dadosGlobais = [];
let chart1, chart2;
let nomeArquivoOriginal = "";

async function processarCSV() {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files[0])
        return alert("Selecione um arquivo!");

    nomeArquivoOriginal = fileInput.files[0].name;

    Papa.parse(fileInput.files[0], {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            dadosGlobais = results.data;
            alert("Dados carregados com sucesso!");

            // Renderiza ambos os gráficos
            renderizarGraficosProdutos(dadosGlobais);
            renderizarGraficosClientes(dadosGlobais);

            renderizarTabelaHTML(dadosGlobais);
            document.getElementById('btnPdf').style.display = 'inline-block';
        }
    });
}

// 1. Gráfico de Produtos (Usa o canvas 'chartProdutos')
function renderizarGraficosProdutos(data) {
    if (chart1) chart1.destroy();

    const colunaAgregadora = 'nome_produto';
    const tituloGrafico = 'Vendas por Produto';

    const contagem = {};
    data.forEach(item => {
        const valor = item[colunaAgregadora];
        if (valor !== undefined && valor !== null) {
            contagem[valor] = (contagem[valor] || 0) + 1;
        }
    });

    const ctx = document.getElementById('chartProdutos').getContext('2d');
    chart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(contagem),
            datasets: [{
                label: 'Quantidade',
                data: Object.values(contagem),
                backgroundColor: 'rgba(46, 125, 50, 0.7)', // Verde da loja
                borderColor: 'rgba(27, 94, 32, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: tituloGrafico } }
        }
    });
}

// 2. Gráfico de Clientes (Usa o canvas 'chartClientes')
function renderizarGraficosClientes(data) {
    if (chart2) chart2.destroy();

    const colunaAgregadora = 'nome_cliente';
    const tituloGrafico = 'Vendas por Cliente';

    const contagem = {};
    data.forEach(item => {
        const valor = item[colunaAgregadora];
        if (valor !== undefined && valor !== null) {
            contagem[valor] = (contagem[valor] || 0) + 1;
        }
    });

    const ctx = document.getElementById('chartClientes').getContext('2d');
    chart2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(contagem),
            datasets: [{
                label: 'Quantidade',
                data: Object.values(contagem),
                backgroundColor: 'rgba(52, 152, 219, 0.7)', // Azul
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: tituloGrafico } }
        }
    });
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    doc.setFontSize(18);
    doc.text("Sabor & Verde - Relatório de Gestão", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22);

    doc.autoTable({
        startY: 30,
        head: [Object.keys(dadosGlobais[0])],
        body: dadosGlobais.map(row => Object.values(row)),
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] },
        margin: { top: 30 }
    });

    doc.save("relatorio_vendas.pdf");
}

function renderizarTabelaHTML(data) {
    const container = document.getElementById('lista');

    if (!data || data.length === 0) {
        container.innerHTML = '<p>Nenhum dado disponível.</p>';
        return;
    }

    const colunas = Object.keys(data[0]);

    let html = `
        <div style="width: 100%; max-height: 350px; overflow-y: auto; overflow-x: auto; border: 1px solid #ddd; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px; text-align: left;">
                <thead style="position: sticky; top: 0; background-color: #2e7d32; z-index: 1;">
                    <tr>
    `;

    colunas.forEach(coluna => {
        html += `<th style="padding: 12px 15px; color: #ffffff; border-bottom: 1px solid #ddd;">${coluna}</th>`;
    });

    html += `</tr></thead><tbody>`;

    data.forEach((item, index) => {
        const corFundo = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        html += `<tr style="background-color: ${corFundo};">`;

        colunas.forEach(coluna => {
            const valor = item[coluna] !== null && item[coluna] !== undefined ? item[coluna] : '';
            html += `<td style="padding: 10px 15px; border-bottom: 1px solid #eee; color: #333333;">${valor}</td>`;
        });

        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}