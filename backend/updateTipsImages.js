const pool = require("./db");
const fetch = require("node-fetch");
require("dotenv").config();

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

async function updateTipsImages() {
  try {
    // Only select tips that have no image yet
    const tips = await pool.query("SELECT id, title FROM tips WHERE image IS NULL");

    for (const tip of tips.rows) {
      const title = encodeURIComponent(tip.title);
      const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${title}&image_type=photo&per_page=3`;

      const res = await fetch(url);
      const data = await res.json();

      let imageUrl = null;

      // Primary search
      if (data?.hits?.length > 0) {
        imageUrl = data.hits[0].webformatURL;
      } else {
        // Try fallback with simpler keywords (e.g. before ":")
        const fallbackTitle = tip.title.split(":")[0].trim();
        const fallbackUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(fallbackTitle)}&image_type=photo&per_page=3`;

        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();

        if (fallbackData?.hits?.length > 0) {
          imageUrl = fallbackData.hits[0].webformatURL;
        }
      }

      // Use found image or default image
      await pool.query(
        "UPDATE tips SET image = $1 WHERE id = $2",
        [imageUrl || DEFAULT_IMAGE, tip.id]
      );

      if (imageUrl) {
        console.log(`✅ Updated tip ID ${tip.id} with image`);
      } else {
        console.warn(`⚠️ No image found for: ${tip.title}, using default`);
      }
    }

    console.log("🎉 Done updating tips!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

updateTipsImages();
