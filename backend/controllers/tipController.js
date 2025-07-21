// controllers/tipController.js
const axios = require("axios");
const cheerio = require("cheerio");
const pool = require("../db");

exports.scrapeTips = async (req, res) => {
  try {
    const response = await axios.get("https://www.healthline.com/health/pregnancy");
    const $ = cheerio.load(response.data);

    const tips = [];

    $("a.css-1m50asq").each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");

      if (title && link) {
        tips.push({
          title,
          link: link.startsWith("http") ? link : `https://www.healthline.com${link}`,
          source: "Healthline",
        });
      }
    });

    for (const tip of tips) {
      await pool.query(
        `INSERT INTO tips (title, link, source, scraped_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [tip.title, tip.link, tip.source]
      );
    }

    res.status(200).json({ message: "Scraped and saved tips!", count: tips.length });
  } catch (error) {
    console.error("Scrape error:", error.message);
    res.status(500).json({ message: "Failed to scrape tips", error: error.message });
  }
};

exports.getTips = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tips ORDER BY scraped_at DESC NULLS LAST, created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tips:", error.message);
    res.status(500).json({ message: "Failed to fetch tips" });
  }
};
