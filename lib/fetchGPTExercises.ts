export const fetchGPTExercises = async (trimester: string, apiKey: string) => {
  const prompt = `Generate 3 safe prenatal exercises for a woman in her ${trimester} for today (${new Date().toDateString()}). Each should include:
  - name
  - description
  - duration (e.g. "15 mins")
  - category (e.g. yoga, walk, kegels)
  - YouTube thumbnail image URL (if any)
  
  Return the result in JSON format as an array like:
  [
    {
      "name": "Prenatal Yoga Flow",
      "description": "A gentle yoga sequence to stretch and relax",
      "duration": "15 mins",
      "category": "yoga",
      "image": "https://img.youtube.com/vi/4pKly2JojMw/0.jpg"
    },
    ...
  ]`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a prenatal fitness assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || "[]"
    return JSON.parse(content)
  } catch (err) {
    console.error("GPT Fetch Failed:", err)
    return []
  }
}
