import * as cheerio from "cheerio"
import express from "express"

const router = express.Router()

// Health tips scraping endpoint
router.get("/scrape-tips", async (req, res) => {
  try {
    console.log("Scraping health tips...")

    const healthSites = [
      "https://www.babycenter.com/pregnancy",
      "https://www.whattoexpect.com/pregnancy/",
      "https://www.healthline.com/health/pregnancy",
    ]

    const allTips = []

    for (const siteUrl of healthSites) {
      try {
        const response = await fetch(siteUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        })

        if (!response.ok) continue

        const html = await response.text()
        const $ = cheerio.load(html)
        const siteName = new URL(siteUrl).hostname.replace("www.", "")

        // Generic selectors that work across most health sites
        const titleSelectors = ["h2 a", "h3 a", ".article-title a", ".post-title a", "article h2", "article h3"]

        for (const selector of titleSelectors) {
          const elements = $(selector)
          if (elements.length > 0) {
            elements.slice(0, 5).each((index, element) => {
              const $el = $(element)
              const title = $el.text().trim()
              let link = $el.attr("href")

              if (title && title.length > 10) {
                // Make sure link is absolute
                if (link && !link.startsWith("http")) {
                  const baseUrl = new URL(siteUrl).origin
                  link = new URL(link, baseUrl).href
                }

                // Find associated image
                const $parent = $el.closest("article, .post, .card, .item")
                let image = $parent.find("img").first().attr("src")
                if (image && !image.startsWith("http")) {
                  const baseUrl = new URL(siteUrl).origin
                  image = new URL(image, baseUrl).href
                }

                allTips.push({
                  id: allTips.length + 1,
                  title: title.substring(0, 100),
                  image: image || `https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=180&fit=crop&q=80`,
                  link: link || siteUrl,
                  source: siteName,
                })
              }
            })
            break // Stop after finding working selector
          }
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error scraping ${siteUrl}:`, error.message)
      }
    }

    // Add fallback tips if scraping didn't work
    if (allTips.length === 0) {
      allTips.push(
        {
          id: 1,
          title: "Stay Hydrated During Pregnancy",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=180&fit=crop&q=80",
          link: "https://www.healthline.com/health/pregnancy/how-much-water-to-drink",
          source: "healthline.com",
        },
        {
          id: 2,
          title: "Essential Prenatal Vitamins",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=180&fit=crop&q=80",
          link: "https://www.babycenter.com/pregnancy/diet-and-fitness/prenatal-vitamins",
          source: "babycenter.com",
        },
        {
          id: 3,
          title: "Safe Pregnancy Exercises",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=180&fit=crop&q=80",
          link: "https://www.whattoexpect.com/pregnancy/fitness-and-exercise/",
          source: "whattoexpect.com",
        },
      )
    }

    // Remove duplicates
    const uniqueTips = allTips.filter(
      (tip, index, self) => index === self.findIndex((t) => t.title.toLowerCase() === tip.title.toLowerCase()),
    )

    res.json({
      success: true,
      tips: uniqueTips.slice(0, 12),
      count: uniqueTips.length,
      scraped_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Scraping API error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to scrape health tips",
      tips: [],
    })
  }
})

export default router
