
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const financialNews = [
  {
    id: 1,
    title: "Bitcoin alcanza nuevo máximo histórico",
    content:
      "Bitcoin ha superado los $70,000 USD en trading, impulsado por la creciente adopción institucional y las expectativas de aprobación de ETFs. Los analistas anticipan un 2024 positivo para las criptomonedas.",
  },
  {
    id: 2,
    title: "Tesla advierte sobre caída en ganancias trimestrales",
    content:
      "Tesla reportó resultados decepcionantes en el último trimestre, con márgenes de ganancia reducidos debido a la competencia creciente y la reducción de precios. Las acciones cayeron un 5% después del anuncio.",
  },
  {
    id: 3,
    title: "Fed mantiene tasas de interés estables",
    content:
      "La Reserva Federal decidió mantener las tasas de interés sin cambios, señalando una posible pausa en el ciclo de endurecimiento. Los mercados respondieron positivamente a la noticia.",
  },
  {
    id: 4,
    title: "Mercado de bonos muestra signos de inestabilidad",
    content:
      "Los rendimientos de bonos del Tesoro fluctúan significativamente mientras los inversores se preocupan por la inflación persistente. Expertos advierten sobre posibles turbulencias en el mercado de renta fija.",
  },
  {
    id: 5,
    title: "Startup de tecnología obtiene financiamiento de $500 millones",
    content:
      "Una prometedora startup de IA aseguró una ronda de financiamiento Serie C por $500 millones, con valoración de unicornio. El mercado de startups de tecnología continúa siendo fuerte.",
  },
];

async function analyzeSentiment(newsArticle) {
  const prompt = `Analiza el sentimiento de la siguiente noticia financiera. Responde ÚNICAMENTE con un JSON válido sin markdown, sin código y sin explicaciones adicionales.

Título: ${newsArticle.title}
Contenido: ${newsArticle.content}

Responde EXACTAMENTE con este formato JSON (sin código markdown, sin comillas de escape):
{"sentiment": "positivo|negativo|neutral", "score": número entre -1 y 1, "explanation": "breve explicación"}`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const analysis = JSON.parse(responseText);
    return analysis;
  } catch {
    // Fallback parsing if JSON is malformed
    let sentiment = "neutral";
    let score = 0;
    let explanation = "No se pudo analizar el sentimiento";

    if (responseText.toLowerCase().includes("positivo")) {
      sentiment = "positivo";
      score = 0.7;
    } else if (responseText.toLowerCase().includes("negativo")) {
      sentiment = "negativo";
      score = -0.7;
    }

    if (responseText.includes("score")) {
      const scoreMatch = responseText.match(/"score":\s*([-\d.]+)/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[1]);
      }
    }

    if (responseText.includes("explanation")) {
      const explanationMatch = responseText.match(/"explanation":\s*"([^"]*)"/);
      if (explanationMatch) {
        explanation = explanationMatch[1];
      }
    }

    return {
      sentiment: sentiment,
      score: score,
      explanation: explanation,
    };
  }
}

async function generateReport(analyses) {
  const reportData = analyses.map((a) => `- ${a.title}: ${a.sentiment}`).join("\n");

  const prompt = `Basándote en el análisis de sentimiento de las siguientes noticias financieras:

${reportData}

Genera un resumen ejecutivo breve sobre el sentimiento general del mercado. Responde en no más de 5 oraciones.`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function main() {
  console.log("🤖 Bot de Análisis de Sentimiento de Noticias Financieras");
  console.log("=".repeat(60));
  console.log("\n📰 Procesando noticias...\n");

  const analyses = [];

  for (const news of financialNews) {
    try {
      console.log(`Analizando: "${news.title}"...`);
      const sentiment = await analyzeSentiment(news);

      const analysis = {
        id: news.id,
        title: news.title,
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        explanation: sentiment.explanation,
      };

      analyses.push(analysis);

      console.log(
        `  ✓ Sentimiento: ${sentiment.sentiment} (Score: ${sentiment.score})`
      );
      console.log(`  ✓ Explicación: ${sentiment.explanation}\n`);
    } catch (error) {
      console.error(`Error analizando noticia ${news.id}:`, error);
    }
  }

  console.