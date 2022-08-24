const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const url = "https://www.almg.gov.br/deputados/conheca_deputados/index.html";

async function scrapeData() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const listItems = $(".result ul li");
    const deputados = [];
    listItems.each((idx, el) => {
      const deputado = { id: "", nome: "", imagem: "", partido: "" };
      deputado.id = ($(el).children(".img-deputado").find("a").attr('href')).split("=")[1].split("&")[0];
      deputado.nome = $(el).children("p").find("a").text();
      deputado.imagem = `https://www.almg.gov.br/export/sites/default/deputados/fotos/${deputado.id}.jpg`;
      deputado.partido = $(el).children(":nth-child(3)").text();
    deputados.push(deputado);
    });
    console.dir(deputados);
    fs.writeFile("deputados.json", JSON.stringify(deputados, null, 3), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    });
  } catch (err) {
    console.error(err);
  }
}
scrapeData();
