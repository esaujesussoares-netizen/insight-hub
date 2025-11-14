--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_weight_goals_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_weight_goals_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: advanced_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advanced_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    measurement_date timestamp with time zone DEFAULT now() NOT NULL,
    basal_metabolic_rate numeric,
    body_water_percentage numeric,
    bone_mass numeric,
    visceral_fat numeric,
    metabolic_age integer,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: body_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.body_measurements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    measurement_date timestamp with time zone DEFAULT now() NOT NULL,
    neck numeric,
    shoulders numeric,
    chest numeric,
    waist numeric,
    hips numeric,
    left_arm numeric,
    right_arm numeric,
    left_forearm numeric,
    right_forearm numeric,
    left_thigh numeric,
    right_thigh numeric,
    left_calf numeric,
    right_calf numeric,
    triceps_skinfold numeric,
    biceps_skinfold numeric,
    subscapular_skinfold numeric,
    suprailiac_skinfold numeric,
    abdominal_skinfold numeric,
    thigh_skinfold numeric,
    calf_skinfold numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: body_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.body_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    weight numeric NOT NULL,
    body_fat_percentage numeric,
    muscle_mass numeric,
    bmi numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: body_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.body_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    photo_date timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text NOT NULL,
    photo_type text,
    weight_at_photo numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT body_photos_photo_type_check CHECK ((photo_type = ANY (ARRAY['front'::text, 'back'::text, 'side'::text])))
);


--
-- Name: calories_burned; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calories_burned (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL,
    calories numeric DEFAULT 0 NOT NULL,
    activity_type text,
    created_at timestamp with time zone DEFAULT now(),
    duration_minutes integer,
    notes text
);


--
-- Name: exercise_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_name text NOT NULL,
    sets integer,
    reps integer,
    weight numeric,
    duration_seconds integer,
    notes text,
    performed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    muscle_group text NOT NULL,
    gif_url text,
    difficulty text,
    description text,
    instructions jsonb,
    tips jsonb,
    equipment jsonb,
    sets integer DEFAULT 3,
    reps text,
    rest_time integer DEFAULT 60,
    duration text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT exercise_library_difficulty_check CHECK ((difficulty = ANY (ARRAY['iniciante'::text, 'intermediario'::text, 'avancado'::text])))
);


--
-- Name: favorite_recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorite_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    ingredients jsonb NOT NULL,
    instructions text NOT NULL,
    macros jsonb,
    servings integer DEFAULT 1,
    prep_time text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    category text,
    tags text[] DEFAULT '{}'::text[],
    CONSTRAINT favorite_recipes_category_check CHECK ((category = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'post_workout'::text, 'snack'::text])))
);


--
-- Name: meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    meal_time text NOT NULL,
    meal_date timestamp with time zone DEFAULT now() NOT NULL,
    foods_details jsonb NOT NULL,
    calories numeric DEFAULT 0 NOT NULL,
    protein numeric DEFAULT 0 NOT NULL,
    carbs numeric DEFAULT 0 NOT NULL,
    fat numeric DEFAULT 0 NOT NULL,
    image_data text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutri_ai_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutri_ai_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: nutri_ai_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutri_ai_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT nutri_ai_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text,
    height numeric,
    daily_calories_goal numeric DEFAULT 2000,
    daily_protein_goal numeric DEFAULT 150,
    daily_carbs_goal numeric DEFAULT 250,
    daily_fat_goal numeric DEFAULT 65,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    age integer,
    weight numeric,
    fitness_goal text,
    avatar_url text,
    daily_calories_burn_goal numeric DEFAULT 500,
    gender text,
    CONSTRAINT fitness_goal_check CHECK (((fitness_goal = ANY (ARRAY['muscle_gain'::text, 'weight_loss'::text, 'maintenance'::text])) OR (fitness_goal IS NULL))),
    CONSTRAINT profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])))
);


--
-- Name: progress_strength; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress_strength (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_name text NOT NULL,
    initial_weight numeric NOT NULL,
    current_weight numeric NOT NULL,
    target_weight numeric NOT NULL,
    unit text DEFAULT 'kg'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_name text NOT NULL,
    achievement_description text,
    completed boolean DEFAULT false,
    points integer DEFAULT 0,
    progress_current integer DEFAULT 0,
    progress_target integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: user_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    goal_name text NOT NULL,
    goal_type text NOT NULL,
    current_value numeric DEFAULT 0,
    target_value numeric NOT NULL,
    unit text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: weight_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weight_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    goal_type text NOT NULL,
    start_weight numeric NOT NULL,
    target_weight numeric NOT NULL,
    current_weight numeric NOT NULL,
    start_date timestamp with time zone DEFAULT now() NOT NULL,
    target_date timestamp with time zone,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    milestones jsonb DEFAULT '[]'::jsonb,
    notifications_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT weight_goals_goal_type_check CHECK ((goal_type = ANY (ARRAY['lose_weight'::text, 'gain_weight'::text, 'maintain_weight'::text, 'gain_muscle'::text])))
);


--
-- Name: workout_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workout_name text NOT NULL,
    duration_seconds integer NOT NULL,
    calories_burned numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone DEFAULT now()
);


--
-- Name: workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    duration_minutes integer,
    estimated_calories integer,
    difficulty text,
    exercises_data jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: advanced_metrics advanced_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_metrics
    ADD CONSTRAINT advanced_metrics_pkey PRIMARY KEY (id);


--
-- Name: body_measurements body_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_measurements
    ADD CONSTRAINT body_measurements_pkey PRIMARY KEY (id);


--
-- Name: body_metrics body_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_metrics
    ADD CONSTRAINT body_metrics_pkey PRIMARY KEY (id);


--
-- Name: body_photos body_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_photos
    ADD CONSTRAINT body_photos_pkey PRIMARY KEY (id);


--
-- Name: calories_burned calories_burned_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calories_burned
    ADD CONSTRAINT calories_burned_pkey PRIMARY KEY (id);


--
-- Name: exercise_history exercise_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_history
    ADD CONSTRAINT exercise_history_pkey PRIMARY KEY (id);


--
-- Name: exercise_library exercise_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_pkey PRIMARY KEY (id);


--
-- Name: favorite_recipes favorite_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_recipes
    ADD CONSTRAINT favorite_recipes_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: nutri_ai_conversations nutri_ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutri_ai_conversations
    ADD CONSTRAINT nutri_ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: nutri_ai_messages nutri_ai_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutri_ai_messages
    ADD CONSTRAINT nutri_ai_messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: progress_strength progress_strength_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_strength
    ADD CONSTRAINT progress_strength_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_goals user_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: weight_goals weight_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_goals
    ADD CONSTRAINT weight_goals_pkey PRIMARY KEY (id);


--
-- Name: workout_history workout_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_history
    ADD CONSTRAINT workout_history_pkey PRIMARY KEY (id);


--
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- Name: idx_exercise_history_exercise_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_history_exercise_name ON public.exercise_history USING btree (exercise_name);


--
-- Name: idx_exercise_history_performed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_history_performed_at ON public.exercise_history USING btree (performed_at);


--
-- Name: idx_exercise_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_history_user_id ON public.exercise_history USING btree (user_id);


--
-- Name: idx_favorite_recipes_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorite_recipes_category ON public.favorite_recipes USING btree (category);


--
-- Name: idx_favorite_recipes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorite_recipes_created_at ON public.favorite_recipes USING btree (created_at DESC);


--
-- Name: idx_favorite_recipes_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorite_recipes_tags ON public.favorite_recipes USING gin (tags);


--
-- Name: idx_favorite_recipes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorite_recipes_user_id ON public.favorite_recipes USING btree (user_id);


--
-- Name: idx_nutri_ai_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutri_ai_conversations_user_id ON public.nutri_ai_conversations USING btree (user_id);


--
-- Name: idx_nutri_ai_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutri_ai_messages_conversation_id ON public.nutri_ai_messages USING btree (conversation_id);


--
-- Name: exercise_library update_exercise_library_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_exercise_library_updated_at BEFORE UPDATE ON public.exercise_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nutri_ai_conversations update_nutri_ai_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nutri_ai_conversations_updated_at BEFORE UPDATE ON public.nutri_ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weight_goals weight_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER weight_goals_updated_at BEFORE UPDATE ON public.weight_goals FOR EACH ROW EXECUTE FUNCTION public.update_weight_goals_updated_at();


--
-- Name: advanced_metrics advanced_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_metrics
    ADD CONSTRAINT advanced_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: body_measurements body_measurements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_measurements
    ADD CONSTRAINT body_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: body_photos body_photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_photos
    ADD CONSTRAINT body_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nutri_ai_messages nutri_ai_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutri_ai_messages
    ADD CONSTRAINT nutri_ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.nutri_ai_conversations(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weight_goals weight_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_goals
    ADD CONSTRAINT weight_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: exercise_library Anyone can view exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view exercises" ON public.exercise_library FOR SELECT USING (true);


--
-- Name: profiles Authenticated users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));


--
-- Name: exercise_library Only admins can delete exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete exercises" ON public.exercise_library FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: exercise_library Only admins can insert exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert exercises" ON public.exercise_library FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: exercise_library Only admins can update exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update exercises" ON public.exercise_library FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: nutri_ai_messages Users can create messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in their conversations" ON public.nutri_ai_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.nutri_ai_conversations
  WHERE ((nutri_ai_conversations.id = nutri_ai_messages.conversation_id) AND (nutri_ai_conversations.user_id = auth.uid())))));


--
-- Name: nutri_ai_conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.nutri_ai_conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_achievements Users can delete their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own achievements" ON public.user_achievements FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: advanced_metrics Users can delete their own advanced metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own advanced metrics" ON public.advanced_metrics FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: body_metrics Users can delete their own body metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own body metrics" ON public.body_metrics FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: calories_burned Users can delete their own calories burned; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own calories burned" ON public.calories_burned FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: nutri_ai_conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.nutri_ai_conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: exercise_history Users can delete their own exercise history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own exercise history" ON public.exercise_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: favorite_recipes Users can delete their own favorite recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own favorite recipes" ON public.favorite_recipes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_goals Users can delete their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own goals" ON public.user_goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: weight_goals Users can delete their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own goals" ON public.weight_goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: meals Users can delete their own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own meals" ON public.meals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: body_measurements Users can delete their own measurements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own measurements" ON public.body_measurements FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: body_photos Users can delete their own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own photos" ON public.body_photos FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: progress_strength Users can delete their own strength progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own strength progress" ON public.progress_strength FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: workout_history Users can delete their own workout history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own workout history" ON public.workout_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: workouts Users can delete their own workouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own workouts" ON public.workouts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_achievements Users can insert their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: advanced_metrics Users can insert their own advanced metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own advanced metrics" ON public.advanced_metrics FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: body_metrics Users can insert their own body metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own body metrics" ON public.body_metrics FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: calories_burned Users can insert their own calories burned; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own calories burned" ON public.calories_burned FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: exercise_history Users can insert their own exercise history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own exercise history" ON public.exercise_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorite_recipes Users can insert their own favorite recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own favorite recipes" ON public.favorite_recipes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_goals Users can insert their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own goals" ON public.user_goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: weight_goals Users can insert their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own goals" ON public.weight_goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: meals Users can insert their own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own meals" ON public.meals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: body_measurements Users can insert their own measurements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own measurements" ON public.body_measurements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: body_photos Users can insert their own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own photos" ON public.body_photos FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: progress_strength Users can insert their own strength progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own strength progress" ON public.progress_strength FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workout_history Users can insert their own workout history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own workout history" ON public.workout_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workouts Users can insert their own workouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own workouts" ON public.workouts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_achievements Users can update their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own achievements" ON public.user_achievements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: advanced_metrics Users can update their own advanced metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own advanced metrics" ON public.advanced_metrics FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: body_metrics Users can update their own body metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own body metrics" ON public.body_metrics FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: calories_burned Users can update their own calories burned; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own calories burned" ON public.calories_burned FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: nutri_ai_conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.nutri_ai_conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: exercise_history Users can update their own exercise history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own exercise history" ON public.exercise_history FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: favorite_recipes Users can update their own favorite recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own favorite recipes" ON public.favorite_recipes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_goals Users can update their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own goals" ON public.user_goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: weight_goals Users can update their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own goals" ON public.weight_goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: meals Users can update their own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own meals" ON public.meals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: body_measurements Users can update their own measurements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own measurements" ON public.body_measurements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: body_photos Users can update their own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own photos" ON public.body_photos FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: progress_strength Users can update their own strength progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own strength progress" ON public.progress_strength FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workout_history Users can update their own workout history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own workout history" ON public.workout_history FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workouts Users can update their own workouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own workouts" ON public.workouts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: nutri_ai_messages Users can view messages from their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from their conversations" ON public.nutri_ai_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.nutri_ai_conversations
  WHERE ((nutri_ai_conversations.id = nutri_ai_messages.conversation_id) AND (nutri_ai_conversations.user_id = auth.uid())))));


--
-- Name: user_achievements Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: advanced_metrics Users can view their own advanced metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own advanced metrics" ON public.advanced_metrics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: body_metrics Users can view their own body metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own body metrics" ON public.body_metrics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: calories_burned Users can view their own calories burned; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own calories burned" ON public.calories_burned FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: nutri_ai_conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.nutri_ai_conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: exercise_history Users can view their own exercise history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own exercise history" ON public.exercise_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: favorite_recipes Users can view their own favorite recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own favorite recipes" ON public.favorite_recipes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_goals Users can view their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own goals" ON public.user_goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: weight_goals Users can view their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own goals" ON public.weight_goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: meals Users can view their own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own meals" ON public.meals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: body_measurements Users can view their own measurements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own measurements" ON public.body_measurements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: body_photos Users can view their own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own photos" ON public.body_photos FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: progress_strength Users can view their own strength progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own strength progress" ON public.progress_strength FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workout_history Users can view their own workout history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own workout history" ON public.workout_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workouts Users can view their own workouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own workouts" ON public.workouts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: advanced_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advanced_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: body_measurements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

--
-- Name: body_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: body_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.body_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: calories_burned; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calories_burned ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_library; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

--
-- Name: favorite_recipes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: meals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

--
-- Name: nutri_ai_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutri_ai_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: nutri_ai_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutri_ai_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: progress_strength; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.progress_strength ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: weight_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weight_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: workout_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

--
-- Name: workouts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


