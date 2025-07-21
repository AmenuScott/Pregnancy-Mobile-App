// controllers/tipController.js
const puppeteer = require("puppeteer");
const pool = require("../db");

exports.scrapeTips = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: puppeteer.executablePath(), // ✅ use Puppeteer's own Chromium
    });

    const page = await browser.newPage();
    await page.goto("https://www.babycenter.com/pregnancy");

    const tips = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("a"));
      return elements
        .map((el) => ({
          title: el.innerText.trim(),
          link: el.href,
        }))
        .filter((tip) => tip.title && tip.link);
    });

    await browser.close();

    for (const tip of tips) {
      await pool.query(
        `INSERT INTO tips (title, link, source, scraped_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [tip.title, tip.link, "BabyCenter"]
      );
    }

    res.status(200).json({ message: "Scraped and saved tips!", count: tips.length });
  } catch (error) {
    console.error("Scrape error:", error.message);
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
