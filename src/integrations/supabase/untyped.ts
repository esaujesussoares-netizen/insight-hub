// Returns an untyped Supabase client to bypass strict Database typings
// Use this while the generated types are unavailable. Safe at runtime.
import { supabase as typedClient } from "./client";

export const supabase = typedClient as any;
