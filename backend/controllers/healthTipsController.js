const axios = require("axios");
const cheerio = require("cheerio");

exports.getHealthTips = async (req, res) => {
  try {
    const { data } = await axios.get("https://www.verywellfamily.com/pregnancy-4013987");
    const $ = cheerio.load(data);
    const tips = [];

    $(".mntl-card-list-items .card").each((i, el) => {
      const title = $(el).find(".card__heading").text().trim();
      const link = $(el).find("a").attr("href");
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");

      if (title && link && image) {
        tips.push({ title, link, image });
      }
    });

    res.json({ tips: tips.slice(0, 10) });
  } catch (error) {
    console.error("Scraping error:", error.message);
    res.status(500).json({ error: "Failed to fetch health tips" });
  }
};
