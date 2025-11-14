export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advanced_metrics: {
        Row: {
          basal_metabolic_rate: number | null
          body_water_percentage: number | null
          bone_mass: number | null
          created_at: string | null
          id: string
          measurement_date: string
          metabolic_age: number | null
          notes: string | null
          user_id: string
          visceral_fat: number | null
        }
        Insert: {
          basal_metabolic_rate?: number | null
          body_water_percentage?: number | null
          bone_mass?: number | null
          created_at?: string | null
          id?: string
          measurement_date?: string
          metabolic_age?: number | null
          notes?: string | null
          user_id: string
          visceral_fat?: number | null
        }
        Update: {
          basal_metabolic_rate?: number | null
          body_water_percentage?: number | null
          bone_mass?: number | null
          created_at?: string | null
          id?: string
          measurement_date?: string
          metabolic_age?: number | null
          notes?: string | null
          user_id?: string
          visceral_fat?: number | null
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          abdominal_skinfold: number | null
          biceps_skinfold: number | null
          calf_skinfold: number | null
          chest: number | null
          created_at: string | null
          hips: number | null
          id: string
          left_arm: number | null
          left_calf: number | null
          left_forearm: number | null
          left_thigh: number | null
          measurement_date: string
          neck: number | null
          notes: string | null
          right_arm: number | null
          right_calf: number | null
          right_forearm: number | null
          right_thigh: number | null
          shoulders: number | null
          subscapular_skinfold: number | null
          suprailiac_skinfold: number | null
          thigh_skinfold: number | null
          triceps_skinfold: number | null
          user_id: string
          waist: number | null
        }
        Insert: {
          abdominal_skinfold?: number | null
          biceps_skinfold?: number | null
          calf_skinfold?: number | null
          chest?: number | null
          created_at?: string | null
          hips?: number | null
          id?: string
          left_arm?: number | null
          left_calf?: number | null
          left_forearm?: number | null
          left_thigh?: number | null
          measurement_date?: string
          neck?: number | null
          notes?: string | null
          right_arm?: number | null
          right_calf?: number | null
          right_forearm?: number | null
          right_thigh?: number | null
          shoulders?: number | null
          subscapular_skinfold?: number | null
          suprailiac_skinfold?: number | null
          thigh_skinfold?: number | null
          triceps_skinfold?: number | null
          user_id: string
          waist?: number | null
        }
        Update: {
          abdominal_skinfold?: number | null
          biceps_skinfold?: number | null
          calf_skinfold?: number | null
          chest?: number | null
          created_at?: string | null
          hips?: number | null
          id?: string
          left_arm?: number | null
          left_calf?: number | null
          left_forearm?: number | null
          left_thigh?: number | null
          measurement_date?: string
          neck?: number | null
          notes?: string | null
          right_arm?: number | null
          right_calf?: number | null
          right_forearm?: number | null
          right_thigh?: number | null
          shoulders?: number | null
          subscapular_skinfold?: number | null
          suprailiac_skinfold?: number | null
          thigh_skinfold?: number | null
          triceps_skinfold?: number | null
          user_id?: string
          waist?: number | null
        }
        Relationships: []
      }
      body_metrics: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          created_at: string | null
          id: string
          muscle_mass: number | null
          user_id: string
          weight: number
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          user_id: string
          weight: number
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      body_photos: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          photo_date: string
          photo_type: string | null
          photo_url: string
          user_id: string
          weight_at_photo: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_date?: string
          photo_type?: string | null
          photo_url: string
          user_id: string
          weight_at_photo?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_date?: string
          photo_type?: string | null
          photo_url?: string
          user_id?: string
          weight_at_photo?: number | null
        }
        Relationships: []
      }
      calories_burned: {
        Row: {
          activity_type: string | null
          calories: number
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          calories?: number
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          calories?: number
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercise_history: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          exercise_name: string
          id: string
          notes: string | null
          performed_at: string | null
          reps: number | null
          sets: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          performed_at?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          performed_at?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: string | null
          equipment: Json | null
          gif_url: string | null
          id: string
          instructions: Json | null
          muscle_group: string
          name: string
          reps: string | null
          rest_time: number | null
          sets: number | null
          tips: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: Json | null
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          muscle_group: string
          name: string
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          tips?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: Json | null
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          muscle_group?: string
          name?: string
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          tips?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favorite_recipes: {
        Row: {
          category: string | null
          created_at: string
          id: string
          ingredients: Json
          instructions: string
          macros: Json | null
          notes: string | null
          prep_time: string | null
          servings: number | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          ingredients: Json
          instructions: string
          macros?: Json | null
          notes?: string | null
          prep_time?: string | null
          servings?: number | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          ingredients?: Json
          instructions?: string
          macros?: Json | null
          notes?: string | null
          prep_time?: string | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          foods_details: Json
          id: string
          image_data: string | null
          meal_date: string
          meal_time: string
          protein: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          foods_details: Json
          id?: string
          image_data?: string | null
          meal_date?: string
          meal_time: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          foods_details?: Json
          id?: string
          image_data?: string | null
          meal_date?: string
          meal_time?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      nutri_ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutri_ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutri_ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "nutri_ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          daily_calories_burn_goal: number | null
          daily_calories_goal: number | null
          daily_carbs_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          fitness_goal: string | null
          gender: string | null
          height: number | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      progress_strength: {
        Row: {
          created_at: string | null
          current_weight: number
          exercise_name: string
          id: string
          initial_weight: number
          target_weight: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_weight: number
          exercise_name: string
          id?: string
          initial_weight: number
          target_weight: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_weight?: number
          exercise_name?: string
          id?: string
          initial_weight?: number
          target_weight?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          points: number | null
          progress_current: number | null
          progress_target: number | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          progress_current?: number | null
          progress_target?: number | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          progress_current?: number | null
          progress_target?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          goal_name: string
          goal_type: string
          id: string
          target_value: number
          unit: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name: string
          goal_type: string
          id?: string
          target_value: number
          unit?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name?: string
          goal_type?: string
          id?: string
          target_value?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_weight: number
          goal_type: string
          id: string
          milestones: Json | null
          notifications_enabled: boolean | null
          start_date: string
          start_weight: number
          target_date: string | null
          target_weight: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_weight: number
          goal_type: string
          id?: string
          milestones?: Json | null
          notifications_enabled?: boolean | null
          start_date?: string
          start_weight: number
          target_date?: string | null
          target_weight: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_weight?: number
          goal_type?: string
          id?: string
          milestones?: Json | null
          notifications_enabled?: boolean | null
          start_date?: string
          start_weight?: number
          target_date?: string | null
          target_weight?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_history: {
        Row: {
          calories_burned: number
          completed_at: string | null
          created_at: string | null
          duration_seconds: number
          id: string
          user_id: string
          workout_name: string
        }
        Insert: {
          calories_burned?: number
          completed_at?: string | null
          created_at?: string | null
          duration_seconds: number
          id?: string
          user_id: string
          workout_name: string
        }
        Update: {
          calories_burned?: number
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          id?: string
          user_id?: string
          workout_name?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          estimated_calories: number | null
          exercises_data: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          estimated_calories?: number | null
          exercises_data?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          estimated_calories?: number | null
          exercises_data?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
