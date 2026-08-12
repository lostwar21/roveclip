export interface AIReviewResult {
  approved: boolean;
  relevance_score: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  is_spam: boolean;
  reason: string;
}

export async function reviewSubmissionWithAI(
  campaignUrl: string,
  campaignTitle: string,
  videoCaption: string,
  videoUrl: string,
  platform: string
): Promise<AIReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in .env. Falling back to manual review.");
    return {
      approved: false,
      relevance_score: 0,
      sentiment: "NEUTRAL",
      is_spam: false,
      reason: "API Key Gemini belum diset. Dialihkan ke Manual Review secara aman."
    };
  }

  const prompt = `
You are the RoveClip AI Fraud & Content Auditor. Your task is to verify if this Clipper's video submission matches the Campaign Brand's original video theme, and analyze it for brand safety.

Brand Campaign Video URL: "${campaignUrl}"
Brand Campaign Video Title/Topic: "${campaignTitle}"
Clipper Video URL: "${videoUrl}" (Platform: ${platform})
Clipper Video Caption/Title: "${videoCaption}"

Task:
1. "relevance_score" (0-100): Analyze if the Clipper's video caption suggests it is relevant to the Campaign Video's topic. Direct match = 80-100. Generic but harmless = 50-79. Irrelevant = 0-49.
2. "sentiment": Evaluate the Clipper's caption sentiment towards the product/brand. Choose "POSITIVE", "NEUTRAL", or "NEGATIVE". If the caption is insulting, mocking, or defaming the brand, mark as NEGATIVE.
3. "is_spam": Set to true if the caption looks like a bot spam (e.g., only random hashtags, repetitive nonsense), otherwise false.
4. "approved": Set to true ONLY IF relevance_score >= 75 AND sentiment is NOT "NEGATIVE" AND is_spam is false. Otherwise, false.

You MUST respond with a JSON object in this EXACT format (no markdown tags):
{
  "approved": boolean,
  "relevance_score": number,
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "is_spam": boolean,
  "reason": "Alasan detail dalam bahasa Indonesia"
}
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini Error:", errText);
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const result: AIReviewResult = JSON.parse(responseText.trim());
    return result;

  } catch (error) {
    console.error("Gemini AI Review Error:", error);
    return {
      approved: false,
      relevance_score: 0,
      sentiment: "NEUTRAL",
      is_spam: false,
      reason: "Gagal menghubungkan atau mengurai respons AI Gemini. Dialihkan ke Manual Review secara aman."
    };
  }
}
