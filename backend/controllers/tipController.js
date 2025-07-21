// controllers/tipController.js
const puppeteer = require("puppeteer");
const pool = require("../db");

exports.scrapeTips = async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto("https://www.babycenter.com/pregnancy", { waitUntil: 'networkidle2' });

    // Wait for article cards to appear
    await page.waitForSelector("article");

    const tips = await page.evaluate(() =>
      Array.from(document.querySelectorAll("article")).map(el => {
        const title = el.querySelector("h2, h3, h4")?.innerText?.trim() || "";
        const linkEl = el.querySelector("a");
        const link = linkEl ? linkEl.href : "";
        const imgEl = el.querySelector("img");
        const image = imgEl ? imgEl.src : null;
        return (title && link) ? { title, link, image } : null;
      }).filter(Boolean)
    );

    let saved = 0;
    for (const tip of tips) {
      await pool.query(
        `INSERT INTO tips (title, link, image, source, scraped_at)
         VALUES ($1, $2, $3, 'BabyCenter', NOW())
         ON CONFLICT DO NOTHING`,
        [tip.title, tip.link, tip.image]
      );
      saved++;
    }

    await browser.close();
    res.status(200).json({ message: "Scraped and saved tips!", count: saved });

  } catch (err) {
    if (browser) await browser.close();
    console.error("Scraping failed:", err.message);
    res.status(500).json({ message: "Scraping failed", error: err.message });
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
