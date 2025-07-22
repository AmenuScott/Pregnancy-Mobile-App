import * as cheerio from "cheerio"

async function scrapeHealthTips(url) {
  try {
    console.log(`Scraping health tips from: ${url}`)

    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const tips = []

    // Generic selectors that work for most health websites
    const articleSelectors = ["article", ".post", ".article", ".content-item", ".health-tip", ".tip-card"]

    let articles = $()
    for (const selector of articleSelectors) {
      articles = $(selector)
      if (articles.length > 0) break
    }

    // If no articles found, try finding divs with health-related content
    if (articles.length === 0) {
      articles = $("div")
        .filter((i, el) => {
          const text = $(el).text().toLowerCase()
          return text.includes("health") || text.includes("tip") || text.includes("pregnancy")
        })
        .slice(0, 10)
    }

    articles.each((index, element) => {
      const $el = $(element)

      // Extract title
      let title = $el.find("h1, h2, h3, h4, .title, .headline").first().text().trim()
      if (!title) {
        title = $el.find("a").first().text().trim()
      }

      // Extract image
      let image = $el.find("img").first().attr("src")
      if (image && !image.startsWith("http")) {
        const baseUrl = new URL(url).origin
        image = new URL(image, baseUrl).href
      }

      // Extract link
      let link = $el.find("a").first().attr("href")
      if (link && !link.startsWith("http")) {
        const baseUrl = new URL(url).origin
        link = new URL(link, baseUrl).href
      }

      // Extract description/content
      let description = $el.find("p, .excerpt, .summary").first().text().trim()
      if (!description) {
        description = $el.text().trim().substring(0, 200) + "..."
      }

      if (title && title.length > 10) {
        tips.push({
          id: index + 1,
          title: title.substring(0, 100),
          description: description.substring(0, 300),
          image: image || "/placeholder.svg?height=180&width=400",
          link: link || url,
          source: new URL(url).hostname,
          scraped_at: new Date().toISOString(),
        })
      }
    })

    console.log(`Successfully scraped ${tips.length} health tips`)
    return tips
  } catch (error) {
    console.error("Scraping error:", error)
    return []
  }
}

// Function to scrape multiple health websites
async function scrapeMultipleHealthSites() {
  const healthSites = [
    "https://www.babycenter.com/pregnancy",
    "https://www.whattoexpect.com/pregnancy/",
    "https://www.parents.com/pregnancy/",
    "https://www.healthline.com/health/pregnancy",
  ]

  const allTips = []

  for (const site of healthSites) {
    try {
      const tips = await scrapeHealthTips(site)
      allTips.push(...tips)

      // Add delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to scrape ${site}:`, error)
    }
  }

  // Remove duplicates based on title similarity
  const uniqueTips = allTips.filter(
    (tip, index, self) => index === self.findIndex((t) => t.title.toLowerCase() === tip.title.toLowerCase()),
  )

  return uniqueTips.slice(0, 20) // Limit to 20 tips
}

// Execute the scraping
scrapeMultipleHealthSites().then((tips) => {
  console.log("Final scraped tips:", JSON.stringify(tips, null, 2))
})
