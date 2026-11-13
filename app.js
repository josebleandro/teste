let dadosGlobais = [];
let chart1, chart2;
let nomeArquivoOriginal = "";

async function processarCSV() {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files[0])
        return alert("Selecione um arquivo!");

    nomeArquivoOriginal = fileInput.files[0].name; // Ex: "categoria_Empréstimos_por_Categoria.csv"

    Papa.parse(fileInput.files[0], {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            dadosGlobais = results.data;
            alert("Dados carregados com sucesso!");
            renderizarGraficos(dadosGlobais);
            renderizarTabelaHTML(dadosGlobais);
            document.getElementById('btnPdf').style.display = 'inline-block';
        }
    });
}

function renderizarGraficos(data) {
    if (chart1)
        chart1.destroy();

    // ANTES (baseado no nome do arquivo):

    // 1. Extrair informações do nome do arquivo
    // Remove a extensão .csv e divide pelo caractere '_'
    //const partesNome = nomeArquivoOriginal.replace('.csv', '').split('_');

    // O primeiro item é a coluna agregadora (ex: "categoria")
    //const colunaAgregadora = partesNome[0];

    // O restante dos itens compõe o título do gráfico
    // Usamos slice(1) para pegar do segundo item em diante e join(' ') para reconstruir a frase
    //const tituloGrafico = partesNome.slice(1).join(' ');

    // AGORA (Definindo fixo a coluna que deseja agrupar, ex: 'categoria_produto'):
    const colunaAgregadora = 'nome_produto';
    const tituloGrafico = 'Vendas por Categoria de Produto';


    console.log("Exemplo:", nomeArquivoOriginal);
    console.log("Coluna identificada:", colunaAgregadora);
    console.log("Título definido:", tituloGrafico);

    // 2. Lógica de contagem baseada na coluna extraída
    const contagem = {};
    data.forEach(item => {
        const valor = item[colunaAgregadora];
        if (valor !== undefined && valor !== null) {
            contagem[valor] = (contagem[valor] || 0) + 1;
        }
    });

    const ctx = document.getElementById('chartCategorias').getContext('2d');
    chart1 = new Chart(ctx, {
        type: 'bar', // Gráfico de barras para melhor leitura de categorias
        data: {
            labels: Object.keys(contagem),
            datasets: [{
                label: 'Quantidade',
                data: Object.values(contagem),
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
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
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' para modo Paisagem, melhor para tabelas largas

    // Cabeçalho personalizado
    doc.setFontSize(18);
    doc.text("Biblioteca - Relatório de Gestão", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22);

    doc.autoTable({
        startY: 30,
        head: [Object.keys(dadosGlobais[0])],
        body: dadosGlobais.map(row => Object.values(row)),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }, // Azul profissional
        margin: { top: 30 }
    });

    doc.save("relatorioBiblioteca.pdf");
}

function renderizarTabelaHTML(data) {
    const container = document.getElementById('lista');

    if (!data || data.length === 0) {
        container.innerHTML = '<p>Nenhum dado disponível.</p>';
        return;
    }

    const colunas = Object.keys(data[0]);

    // Container externo com largura de 100% (igual ao bloco do gráfico) e scroll se necessário
    let html = `
        <div style="width: 100%; max-height: 350px; overflow-y: auto; overflow-x: auto; border: 1px solid #ddd; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px; text-align: left;">
                <thead style="position: sticky; top: 0; background-color: #2980b9; z-index: 1;">
                    <tr>
    `;

    // Adiciona o cabeçalho (com o cabeçalho fixo ao rolar para baixo)
    colunas.forEach(coluna => {
        html += `<th style="padding: 12px 15px; color: #ffffff; border-bottom: 1px solid #ddd;">${coluna}</th>`;
    });

    html += `
                    </tr>
                </thead>
                <tbody>
    `;

    // Adiciona os dados das linhas com cores alternadas
    data.forEach((item, index) => {
        const corFundo = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        html += `<tr style="background-color: ${corFundo};">`;

        colunas.forEach(coluna => {
            const valor = item[coluna] !== null && item[coluna] !== undefined ? item[coluna] : '';
            html += `<td style="padding: 10px 15px; border-bottom: 1px solid #eee; color: #333333;">${valor}</td>`;
        });

        html += `</tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}
