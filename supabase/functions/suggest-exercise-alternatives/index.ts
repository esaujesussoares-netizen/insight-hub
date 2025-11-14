import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization token provided' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { exerciseName, muscleGroup, difficulty, reason } = await req.json();

    // Fetch available exercises from library
    const { data: exerciseLibrary, error: libraryError } = await supabase
      .from('exercise_library')
      .select('name, muscle_group, difficulty, description, equipment')
      .eq('muscle_group', muscleGroup)
      .neq('name', exerciseName);

    if (libraryError) {
      console.error('Library error:', libraryError);
    }

    const systemPrompt = `You are a fitness expert suggesting exercise alternatives.
The user cannot perform "${exerciseName}" which targets ${muscleGroup}.
${reason ? `Reason: ${reason}` : ''}

Suggest 3-5 alternative exercises from the available library that:
1. Target the same muscle group (${muscleGroup})
2. Are appropriate for ${difficulty || 'any'} difficulty level
3. Provide variety in movement patterns and equipment
4. Are safer or more accessible if injury/limitation was mentioned

Return alternatives using the suggest_exercise_alternatives tool.`;

    const userPrompt = `Available exercises for ${muscleGroup}:
${exerciseLibrary?.map(e => `- ${e.name} (${e.difficulty || 'intermediate'}) - ${e.description || 'No description'}`).join('\n') || 'No exercises found'}

Suggest the best alternatives for someone who cannot do "${exerciseName}".`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_exercise_alternatives",
            description: "Suggest alternative exercises for the same muscle group",
            parameters: {
              type: "object",
              properties: {
                alternatives: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      exerciseName: { type: "string", description: "Name of the alternative exercise" },
                      reason: { type: "string", description: "Why this is a good alternative (2-3 sentences)" },
                      difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                      equipmentNeeded: { type: "array", items: { type: "string" } }
                    },
                    required: ["exerciseName", "reason"]
                  }
                },
                generalAdvice: { 
                  type: "string", 
                  description: "Brief advice about exercise substitution" 
                }
              },
              required: ["alternatives"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "suggest_exercise_alternatives" } }
    };

    console.log('Calling Lovable AI for exercise alternatives...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error('Failed to generate exercise alternatives');
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No alternatives generated');
    }

    const alternatives = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(alternatives), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-exercise-alternatives function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
