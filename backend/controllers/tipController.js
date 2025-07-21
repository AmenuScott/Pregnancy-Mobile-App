// controllers/tipController.js
exports.scrapeTips = async (req, res) => {
  try {
    // Just test response for now
    res.status(200).json({ message: "Tips scraped successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to scrape tips", error });
  }
};
