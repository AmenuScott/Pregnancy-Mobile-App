// controllers/tipController.js
const pool = require("../db");
const axios = require("axios");
const cheerio = require("cheerio");

exports.scrapeTips = async (req, res) => {
  try {
    const { data: html } = await axios.get("https://www.babycenter.com/pregnancy");

    const $ = cheerio.load(html);

    const tips = [];

    $(".card-title, .article-card__title, h2, h3").each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        tips.push(text);
      }
    });

    res.json({ message: "Scraped tips using cheerio!", count: tips.length, tips });
  } catch (error) {
    console.error("Scraping failed:", error.message);
    res.status(500).json({ message: "Scraping failed", error: error.message });
  }
};


exports.getTips = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tips ORDER BY scraped_at DESC NULLS LAST, created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetching tips failed:", err.message);
    res.status(500).json({ message: "Failed to fetch tips", error: err.message });
  }
};
