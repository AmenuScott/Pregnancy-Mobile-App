export const fetchGPTExercises = async (trimester: string, apiKey: string) => {
const prompt = `Return ONE prenatal exercise for a pregnant woman in her second trimester as raw JSON only. Do not include any explanation or markdown. Format:

{
  "name": "Exercise name",
  "description": "Short description",
  "duration": "10 minutes",
  "category": "Stretching",
  "image": "https://..."
}`


  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
