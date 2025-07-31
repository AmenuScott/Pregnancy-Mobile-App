import 'dotenv/config'

export default {
  expo: {
    name: "PregWell",
    slug: "pregwell",
    version: "1.0.0",
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
}
