// controllers/tipController.js
const pool = require("../db");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.scrapeTips = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://www.babycenter.com/pregnancy");

    // Example scraping logic (replace with what you need)
    const tips = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h2")).map((el) => el.innerText);
    });

    await browser.close();

    res.json({ message: "Scraped and saved tips!", count: tips.length, tips });
  } catch (error) {
    console.error(error);
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
