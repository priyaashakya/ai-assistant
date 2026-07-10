import axios from "axios";

// Groq uses the OpenAI-compatible /chat/completions format.
// Docs: https://console.groq.com/docs/quickstart
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const aiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes("your_groq_api_key")) {
      console.log(
        "Groq error: GROQ_API_KEY is missing or still has the placeholder value in backend/.env",
      );
      return null;
    }

    const systemPrompt = `You are a virtual assistant named ${assistantName}, created by ${userName}.
You are not any other company's assistant. You behave like a friendly, voice-enabled personal assistant.
Your task is to understand the user's natural language input and respond with ONLY a valid JSON object like this,
with no extra text, no markdown, no code fences:

{
  "type": "general | google_search | youtube_search | youtube_play | youtube_open | get_time | get_date | get_day | get_month | calculator_open | instagram_open | facebook_open | weather_show | whatsapp_open | code_open",
  "userInput": "<original user input, but remove your name from it if mentioned, and if type is 'google_search' or 'youtube_search' or 'youtube_play' extract only the search query>",
  "location": "<if type is 'weather_show' and a city/place is mentioned, put it here (e.g. 'Mumbai'); otherwise empty string>",
  "response": "<a short, friendly spoken response to read out to the user>"
}

Instructions:
- "type": determine the correct category from the intent of the user.
- Use "youtube_open" when the user just wants YouTube opened with no specific search/video mentioned (e.g. "open youtube").
- Use "youtube_search" when they want to search YouTube for something.
- Use "youtube_play" when they want to directly play/watch a specific video or song.
- "userInput": original user input (remove your name from it if mentioned).
- "response": a short spoken response for a voice assistant to say back, in the assistant's voice/persona, friendly and helpful.
- Use "general" if it's a factual or conversational question with no specific action.
- Only respond with the JSON object. No extra text, no markdown, no code fences.`;

    const result = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    const text = result.data?.choices?.[0]?.message?.content;
    if (!text) {
      console.log(
        "Groq returned no usable content:",
        JSON.stringify(result.data),
      );
      return null;
    }

    return text.replace(/```json|```/g, "").trim();
  } catch (error) {
    console.log(
      "Groq error:",
      error?.response?.status,
      error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message,
    );
    return null;
  }
};

export default aiResponse;
