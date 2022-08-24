const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const qs = require("qs");

async function scrapeData() {
  const periodos = [
    "022019",
    "032019",
    "042019",
    "052019",
    "062019",
    "072019",
    "082019",
    "092019",
    "102019",
    "112019",
    "122019",
    "012020",
    "022020",
    "032020",
    "042020",
    "052020",
    "062020",
    "072020",
    "082020",
    "092020",
    "102020",
    "112020",
    "122020",
    "012021",
    "022021",
    "032021",
    "042021",
    "052021",
    "062021",
    "072021",
    "082021",
    "092021",
    "102021",
    "112021",
    "122021",
    "012022",
    "022022",
    "032022",
    "042022",
    "052022",
    "062022",
    "072022",
    "082022",
    "092022",
    "102022",
    "112022",
    "122022",
    "072022",
  ];

  try {
    const rawData = fs.readFileSync("deputados.json");
    const deputados = JSON.parse(rawData);

    const gastosDeputados = [];

    for (const deputado of deputados) {
      // const deputado = deputados[1];
      console.log("Deputado: " + deputado.nome);
      const gastoDeputado = {};
      gastoDeputado.deputado = deputado;
      gastoDeputado.gastosPorPeriodo = [];

      let total = 0;

      for (const periodo of periodos) {
        console.log("Apurando periodo: ", periodo);
        let gastoPeriodo = {
          periodo: periodo,
          total: 0,
          gastosPorCategoria: [],
        };

        let url = `https://www.almg.gov.br/deputados/verbas_indenizatorias/index.html?idDep=${deputado.id}`;

        const { data } = await axios.post(url, qs.stringify({ periodo }));
        const $ = cheerio.load(data);
        const listItems = $(".verbas-indenizatorias ul li");
        const listItemArray = Array.from(new Set(listItems));
        const totalElement = listItemArray.pop();
        const totalValue = $(totalElement).find(".valores-verba").text();

        gastoPeriodo.total = Number(totalValue.replace(/[^0-9]+/g, "")) / 100;
        total += gastoPeriodo.total;

        const gastosPorCategoria = [];

        listItems.each((idx, el) => {
          const gastoPorCategoria = {};
          gastoPorCategoria.categoria = $(el)
            .find(".verbas-item1")
            .children("strong")
            .text();
          gastoPorCategoria.totalCategoria = $(el)
            .find(".valores-verba")
            .text();
          gastoPorCategoria.detalhes = [];
          // console.log("Categoria: ", gastoPorCategoria.categoria)

          const dtable = $(el)
            .children(":nth-child(2)")
            .find("#verbas-indenizatorias-detalhe tbody tr");

          // console.log("Notas encontradas: ", dtable.length)
          dtable.each((i, row) => {
            const detalhe = {
              emitente: "",
              documento: "",
              data: "",
              numero: "",
              valor: "",
              reembolsavel: "",
            };
            detalhe.emitente = $(row).children(":nth-child(1)").text();
            detalhe.documento = $(row).children(":nth-child(2)").text();
            detalhe.data = $(row).children(":nth-child(3)").text();
            detalhe.numero = $(row).children(":nth-child(4)").text();
            detalhe.valor = $(row).children(":nth-child(5)").text();
            detalhe.reembolsavel = $(row).children(":nth-child(6)").text();
            gastoPorCategoria.detalhes.push(detalhe);
          });
          gastosPorCategoria.push(gastoPorCategoria);
        });

        gastoPeriodo.gastosPorCategoria = gastosPorCategoria;
        gastoDeputado.gastosPorPeriodo.push(gastoPeriodo);
      }
      gastoDeputado.gastoTotal = total;
      gastosDeputados.push(gastoDeputado);
    }

    fs.writeFile(
      "gastos.json",
      JSON.stringify(gastosDeputados, null, 4),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      }
    );
  } catch (err) {
    console.error(err);
  }
}
scrapeData();
