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

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!user) {
      console.error('No user found in token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not found' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fitness_goal, age, gender, weight, height')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Fetch recent workout history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentWorkouts, error: workoutsError } = await supabase
      .from('workout_history')
      .select('workout_name, completed_at, duration_seconds, calories_burned')
      .eq('user_id', user.id)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(10);

    if (workoutsError) {
      console.error('Workouts error:', workoutsError);
    }

    // Fetch recent exercise history
    const { data: recentExercises, error: exercisesError } = await supabase
      .from('exercise_history')
      .select('exercise_name, performed_at, sets, reps, weight')
      .eq('user_id', user.id)
      .gte('performed_at', thirtyDaysAgo.toISOString())
      .order('performed_at', { ascending: false })
      .limit(15);

    if (exercisesError) {
      console.error('Exercises error:', exercisesError);
    }

    // Fetch available exercises from library
    const { data: exerciseLibrary, error: libraryError } = await supabase
      .from('exercise_library')
      .select('name, muscle_group, difficulty, description, sets, reps, rest_time');

    if (libraryError) {
      console.error('Library error:', libraryError);
    }

    // Build context for AI
    const userContext = {
      fitnessGoal: profile?.fitness_goal || 'general fitness',
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      recentWorkouts: recentWorkouts || [],
      recentExercises: recentExercises || [],
      availableExercises: exerciseLibrary || []
    };

    const systemPrompt = `You are an expert fitness coach creating personalized workout recommendations. 
Analyze the user's profile and workout history to suggest 5-7 exercises that:
1. Align with their fitness goal (${userContext.fitnessGoal})
2. Match their experience level based on recent activity
3. Provide variety by focusing on muscle groups they haven't trained recently
4. Progress appropriately from their recent workouts
5. Are available in the exercise library

Consider:
- Recovery time between muscle groups
- Progressive overload principles
- Balance between compound and isolation exercises
- Workout frequency and volume

Return recommendations in this exact JSON format using the suggest_workout_plan tool.`;

    const userPrompt = `User Profile:
- Fitness Goal: ${userContext.fitnessGoal}
- Age: ${userContext.age || 'unknown'}
- Gender: ${userContext.gender || 'unknown'}

Recent Workouts (last 30 days):
${userContext.recentWorkouts.map(w => `- ${w.workout_name} (${new Date(w.completed_at).toLocaleDateString()})`).join('\n') || 'No recent workouts'}

Recent Exercises:
${userContext.recentExercises.map(e => `- ${e.exercise_name} (${e.sets}x${e.reps}${e.weight ? ` @ ${e.weight}kg` : ''})`).join('\n') || 'No recent exercises'}

Available Exercises:
${userContext.availableExercises.map(e => `- ${e.name} (${e.muscle_group}, ${e.difficulty})`).join('\n')}

Generate a personalized workout plan with exercise recommendations.`;

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
            name: "suggest_workout_plan",
            description: "Suggest a personalized workout plan with specific exercises",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      exerciseName: { type: "string", description: "Name of the exercise from the library" },
                      muscleGroup: { type: "string", description: "Primary muscle group targeted" },
                      sets: { type: "number", description: "Recommended number of sets" },
                      reps: { type: "string", description: "Recommended reps or duration" },
                      restTime: { type: "number", description: "Rest time in seconds between sets" },
                      reason: { type: "string", description: "Why this exercise is recommended for the user" },
                      difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                    },
                    required: ["exerciseName", "muscleGroup", "sets", "reps", "reason"]
                  }
                },
                overallAdvice: { 
                  type: "string", 
                  description: "General advice about the workout plan and progression" 
                }
              },
              required: ["recommendations", "overallAdvice"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "suggest_workout_plan" } }
    };

    console.log('Calling Lovable AI for workout recommendations...');
    
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
      throw new Error('Failed to generate workout recommendations');
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No workout recommendations generated');
    }

    const workoutPlan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(workoutPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-workout function:', error);
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