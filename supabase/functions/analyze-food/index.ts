import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Banco de dados nutricional expandido (valores por 100g)
const nutritionDatabase: Record<string, any> = {
  // Frutas
  "maçã": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: "100g" },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: "100g" },
  "laranja": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, portion: "100g" },
  "morango": { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, portion: "100g" },
  "abacate": { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, portion: "100g" },
  
  // Grãos e Cereais
  "arroz integral": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: "100g cozido" },
  "arroz branco": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g cozido" },
  "arroz branco cozido": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g" },
  "arroz integral cozido": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: "100g" },
  "arroz": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g" },
  "pão integral": { calories: 247, protein: 13, carbs: 41, fat: 3.4, portion: "100g" },
  "pão": { calories: 265, protein: 9, carbs: 49, fat: 3.2, portion: "100g" },
  "macarrão": { calories: 131, protein: 5, carbs: 25, fat: 1.1, portion: "100g cozido" },
  "aveia": { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, portion: "100g" },
  
  // Leguminosas
  "feijão preto": { calories: 132, protein: 8.9, carbs: 24, fat: 0.5, portion: "100g cozido" },
  "feijão carioca": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g cozido" },
  "feijão carioca cozido": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g" },
  "feijão": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g" },
  "lentilha": { calories: 116, protein: 9, carbs: 20, fat: 0.4, portion: "100g cozida" },
  "grão-de-bico": { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, portion: "100g cozido" },
  
  // Proteínas
  "frango grelhado": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "peito de frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "peito de frango grelhado": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "carne bovina": { calories: 250, protein: 26, carbs: 0, fat: 15, portion: "100g" },
  "carne": { calories: 250, protein: 26, carbs: 0, fat: 15, portion: "100g" },
  "peixe grelhado": { calories: 206, protein: 22, carbs: 0, fat: 12, portion: "100g" },
  "peixe": { calories: 206, protein: 22, carbs: 0, fat: 12, portion: "100g" },
  "salmão": { calories: 208, protein: 20, carbs: 0, fat: 13, portion: "100g" },
  "atum": { calories: 132, protein: 28, carbs: 0, fat: 1, portion: "100g" },
  "ovo": { calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: "unidade (50g)" },
  "ovo cozido": { calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: "100g" },
  
  // Vegetais
  "batata doce": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, portion: "100g" },
  "batata": { calories: 77, protein: 2, carbs: 17, fat: 0.1, portion: "100g" },
  "brócolis": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, portion: "100g" },
  "brócolis cozido": { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, portion: "100g" },
  "salada": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, portion: "100g" },
  "alface": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, portion: "100g" },
  "tomate": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, portion: "100g" },
  "cenoura": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, portion: "100g" },
  "pimentão": { calories: 20, protein: 1, carbs: 4.6, fat: 0.3, portion: "100g" },
  "cebola": { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, portion: "100g" },
  "abobrinha": { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, portion: "100g" },
  
  // Laticínios
  "leite": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, portion: "100ml" },
  "iogurte": { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, portion: "100g" },
  "iogurte grego": { calories: 97, protein: 9, carbs: 3.6, fat: 5, portion: "100g" },
  "queijo": { calories: 402, protein: 25, carbs: 1.3, fat: 33, portion: "100g" },
};

// Função para buscar dados nutricionais da API USDA (com retry)
async function fetchUSDANutrition(foodName: string, retryCount = 0): Promise<any | null> {
  try {
    const apiKey = "DEMO_KEY"; // API pública gratuita
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${apiKey}&pageSize=1`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      if (response.status === 429 && retryCount < 1) {
        // Retry após rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUSDANutrition(foodName, retryCount + 1);
      }
      return null;
    }
    
    const data = await response.json();
    const food = data.foods?.[0];
    
    if (!food) return null;
    
    // Extrair nutrientes
    const nutrients = food.foodNutrients || [];
    const getN = (name: string) => nutrients.find((n: any) => n.nutrientName.toLowerCase().includes(name.toLowerCase()))?.value || 0;
    
    return {
      calories: getN("Energy") || getN("Calories"),
      protein: getN("Protein"),
      carbs: getN("Carbohydrate"),
      fat: getN("Total lipid") || getN("Fat"),
      source: "USDA API"
    };
  } catch (error) {
    console.error(`Erro ao buscar ${foodName} na USDA:`, error);
    return null;
  }
}

// Função para fazer matching flexível do banco local
function findLocalNutrition(foodName: string): any | null {
  const searchName = foodName.toLowerCase().trim();
  
  // 1. Busca exata
  if (nutritionDatabase[searchName]) {
    return { ...nutritionDatabase[searchName], source: "Local DB (exact)" };
  }
  
  // 2. Busca parcial (ingrediente contém termo ou termo contém ingrediente)
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (searchName.includes(key) || key.includes(searchName)) {
      return { ...value, source: `Local DB (partial: ${key})` };
    }
  }
  
  // 3. Busca por palavras-chave principais
  const keywords = searchName.split(" ");
  for (const keyword of keywords) {
    if (keyword.length < 3) continue; // Ignora palavras muito curtas
    
    for (const [key, value] of Object.entries(nutritionDatabase)) {
      if (key.includes(keyword)) {
        return { ...value, source: `Local DB (keyword: ${key})` };
      }
    }
  }
  
  return null;
}

// Função para estimar porção em gramas
function estimatePortionGrams(portionText: string): number {
  const match = portionText.match(/(\d+)\s*g/i);
  if (match) return parseInt(match[1]);
  
  const matchMl = portionText.match(/(\d+)\s*ml/i);
  if (matchMl) return parseInt(matchMl[1]); // 1ml ≈ 1g para líquidos
  
  // Estimativas para porções comuns
  if (portionText.includes("unidade") || portionText.includes("unit")) return 50;
  if (portionText.includes("colher")) return 15;
  if (portionText.includes("xícara") || portionText.includes("cup")) return 240;
  if (portionText.includes("prato")) return 200;
  
  return 100; // Default 100g
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, imageBase64 } = await req.json();
    const image = imageData || imageBase64;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração de IA não disponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Iniciando análise de imagem com IA...");

    // Preparar imagem para a API (remover prefixo data:image se presente)
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

    // Chamar Lovable AI com Gemini Vision para análise de alimentos
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Modelo mais preciso para visão
        messages: [
          {
            role: "system",
            content: `Você é um especialista em nutrição e identificação de alimentos. Analise a imagem fornecida seguindo estas diretrizes:

IDENTIFICAÇÃO DE ALIMENTOS:
- Liste TODOS os alimentos visíveis, mesmo os parcialmente ocultos ou em pequenas quantidades
- Destaque ingredientes compostos (ex.: lasanha → massa, molho, queijo, carne)
- Considere variações regionais ou culturais de nomes de alimentos
- Evite confusões entre alimentos similares (ex.: maçã vs tomate, laranja vs tangerina)
- Considere iluminação, ângulo e cor ao identificar

ESTIMATIVA DE PORÇÕES:
- Use referências visuais (prato, mão, talheres) para estimar volumes
- Informe a unidade de medida (gramas, xícaras, colheres, unidades) junto com a estimativa
- Seja o mais preciso possível baseado no contexto visual
- Indique o nível de confiança da estimativa (alta/média/baixa)

OBSERVAÇÕES ADICIONAIS:
- Inclua possíveis alergênicos comuns (glúten, lactose, amendoim, etc.)
- Sugira substituições saudáveis quando aplicável
- Sinalize se a imagem estiver com baixa qualidade ou iluminação inadequada
- Forneça uma descrição detalhada e contextual da refeição

Retorne APENAS um JSON válido no seguinte formato:
{
  "foods": [
    {
      "name": "nome do alimento em português (minúsculas)",
      "portion": "porção estimada com unidade (ex: 150g, 1 xícara, 2 colheres)",
      "confidence": "alta/média/baixa"
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "notes": "Descrição detalhada da refeição identificada, incluindo: composição visual, confiança da análise, possíveis alergênicos detectados, qualidade da imagem, e observações nutricionais relevantes."
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta imagem e identifique todos os alimentos presentes com suas informações nutricionais."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.3, // Baixa temperatura para respostas mais determinísticas
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API de IA:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao analisar imagem com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("Resposta da IA recebida");

    // Extrair conteúdo da resposta
    const aiContent = aiResponse.choices?.[0]?.message?.content;
    if (!aiContent) {
      console.error("Resposta da IA vazia");
      return new Response(
        JSON.stringify({ error: "Não foi possível analisar a imagem" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse do JSON retornado pela IA
    let aiResult;
    try {
      // Extrair JSON da resposta (pode vir com texto ao redor)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Formato de resposta inválido");
      }
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", parseError);
      console.error("Conteúdo recebido:", aiContent);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enriquecer com dados nutricionais (API -> Local DB -> Estimativa)
    const enrichedFoods = await Promise.all(
      aiResult.foods.map(async (food: any) => {
        const foodName = food.name.toLowerCase();
        const portionGrams = estimatePortionGrams(food.portion || "100g");
        let nutritionData = null;
        let isEstimated = false;
        
        // 1. Tentar buscar na API USDA
        console.log(`Buscando nutrição para: ${foodName}`);
        nutritionData = await fetchUSDANutrition(foodName);
        
        // 2. Se API falhar, buscar no banco local com matching flexível
        if (!nutritionData) {
          console.log(`USDA falhou, buscando localmente: ${foodName}`);
          nutritionData = findLocalNutrition(foodName);
        }
        
        // 3. Se ainda não encontrou, usar estimativa básica
        if (!nutritionData) {
          console.warn(`⚠️ Não encontrado: ${foodName} - usando estimativa`);
          isEstimated = true;
          nutritionData = {
            calories: 100, // Estimativa conservadora
            protein: 5,
            carbs: 15,
            fat: 3,
            source: "Estimativa (não encontrado)"
          };
        }
        
        // Calcular valores baseados na porção
        const multiplier = portionGrams / 100; // Base é sempre 100g
        const calculatedCalories = Math.round((nutritionData.calories || 0) * multiplier);
        const calculatedProtein = Math.round((nutritionData.protein || 0) * multiplier * 10) / 10;
        const calculatedCarbs = Math.round((nutritionData.carbs || 0) * multiplier * 10) / 10;
        const calculatedFat = Math.round((nutritionData.fat || 0) * multiplier * 10) / 10;
        
        console.log(`${foodName}: ${portionGrams}g = ${calculatedCalories} kcal (fonte: ${nutritionData.source})`);
        
        return {
          ...food,
          portionGrams,
          calories: calculatedCalories,
          protein: calculatedProtein,
          carbs: calculatedCarbs,
          fat: calculatedFat,
          source: nutritionData.source,
          isEstimated,
          ...(isEstimated && { note: "Valores estimados - alimento não encontrado nas bases de dados" })
        };
      })
    );

    // Recalcular totais com dados enriquecidos
    const totals = enrichedFoods.reduce(
      (acc: any, food: any) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    // Validação: NUNCA retornar totais zerados se alimentos foram detectados
    if (enrichedFoods.length > 0 && totals.calories === 0) {
      console.error("⚠️ ERRO: Total de calorias zerado com alimentos detectados!");
      console.error("Foods:", enrichedFoods);
      
      // Recalcular com estimativa mínima (média de 150 kcal por alimento)
      const estimatedCalories = enrichedFoods.length * 150;
      const estimatedProtein = enrichedFoods.length * 8;
      const estimatedCarbs = enrichedFoods.length * 20;
      const estimatedFat = enrichedFoods.length * 5;
      
      totals.calories = estimatedCalories;
      totals.protein = estimatedProtein;
      totals.carbs = estimatedCarbs;
      totals.fat = estimatedFat;
      
      // Marcar todos como estimados
      enrichedFoods.forEach(food => {
        food.isEstimated = true;
        food.note = "Valores estimados por falha no cálculo original";
      });
    }
    
    // Arredondar totais
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;
    
    const hasEstimated = enrichedFoods.some((f: any) => f.isEstimated);

    // Calcular confiança média
    const avgConfidence = enrichedFoods.reduce((sum: number, f: any) => {
      const confidence = f.confidence === 'alta' ? 0.9 : f.confidence === 'média' ? 0.7 : 0.5;
      return sum + confidence;
    }, 0) / enrichedFoods.length;

    // Formatar resposta no padrão esperado pelo componente
    const result = {
      status: 'sucesso',
      analise: {
        alimentos: enrichedFoods.map((food: any) => ({
          name: food.name,
          quantity: food.portion || `${food.portionGrams}g`,
          confidence: food.confidence === 'alta' ? 0.9 : food.confidence === 'média' ? 0.7 : 0.5,
          nutrition: {
            calories: food.calories || 0,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
          },
          source: food.source || 'Estimativa'
        })),
        total_refeicao: {
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
        },
        metadados: {
          timestamp: new Date().toISOString(),
          fontes_utilizadas: [...new Set(enrichedFoods.map((f: any) => f.source || 'Estimativa'))],
          confianca_media: avgConfidence,
        }
      },
      isEstimated: hasEstimated,
      notes: aiResult.notes || "",
    };

    console.log("✅ Análise concluída:", {
      foodsCount: enrichedFoods.length,
      totalCalories: totals.calories,
      isEstimated: hasEstimated
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função analyze-food:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro inesperado ao analisar imagem",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
