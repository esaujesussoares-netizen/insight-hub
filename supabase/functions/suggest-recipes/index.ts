import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fitnessGoal, dailyCalories, dailyProtein, dailyCarbs, dailyFat } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Mapear objetivos para contexto nutricional
    const goalMap: Record<string, string> = {
      'weight_loss': 'perda de peso com déficit calórico, rica em proteínas e baixa em carboidratos',
      'muscle_gain': 'ganho de massa muscular com superávit calórico, muito rica em proteínas',
      'maintenance': 'manutenção do peso com macros balanceados',
      'endurance': 'resistência com ênfase em carboidratos complexos',
      'strength': 'força e potência com alta proteína e carboidratos moderados',
    };
    const goalContext = goalMap[fitnessGoal] || 'saudável e balanceada';

    const systemPrompt = `Você é um chef especializado em nutrição esportiva e fitness. Gere EXATAMENTE 4 receitas aleatórias e variadas para um objetivo de ${goalContext}.

IMPORTANTE:
- As receitas devem ser COMPLETAMENTE DIFERENTES entre si (café da manhã, almoço, lanche, jantar)
- Varie os tipos de proteína (frango, peixe, carne vermelha, ovos, leguminosas)
- Inclua diferentes estilos culinários (brasileiro, mediterrâneo, asiático, etc)
- Seja criativo e evite receitas genéricas
- Cada receita deve ter valores nutricionais compatíveis com as metas diárias

Metas nutricionais diárias:
- Calorias: ${dailyCalories} kcal
- Proteína: ${dailyProtein}g
- Carboidratos: ${dailyCarbs}g
- Gorduras: ${dailyFat}g

Para cada receita, considere que ela representa uma refeição (cerca de 25-35% das metas diárias).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: 'Gere 4 receitas totalmente diferentes e criativas seguindo as especificações.'
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_recipes',
            description: 'Gera receitas personalizadas baseadas nos objetivos do usuário',
            parameters: {
              type: 'object',
              properties: {
                recipes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Nome da receita' },
                      description: { type: 'string', description: 'Descrição breve' },
                      prepTime: { type: 'string', description: 'Tempo de preparo (ex: 30 min)' },
                      servings: { type: 'number', description: 'Número de porções' },
                      calories: { type: 'number', description: 'Calorias por porção' },
                      protein: { type: 'number', description: 'Proteína em gramas' },
                      carbs: { type: 'number', description: 'Carboidratos em gramas' },
                      fat: { type: 'number', description: 'Gorduras em gramas' },
                      ingredients: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de ingredientes com quantidades'
                      },
                      instructions: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Passos do modo de preparo'
                      },
                      category: {
                        type: 'string',
                        description: 'Categoria da refeição',
                        enum: ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Pós-Treino']
                      }
                    },
                    required: ['title', 'description', 'prepTime', 'servings', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'instructions', 'category']
                  }
                }
              },
              required: ['recipes']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_recipes' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Por favor, adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('Erro na API Lovable AI:', response.status, errorText);
      throw new Error('Erro ao gerar receitas');
    }

    const data = await response.json();
    console.log('Resposta da API:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('Nenhuma receita gerada');
    }

    const recipes = JSON.parse(toolCall.function.arguments).recipes;

    return new Response(
      JSON.stringify({ recipes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro em suggest-recipes:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao gerar receitas' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
