// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const supUrl = Deno.env.get("_SUPABASE_URL") as string;
const supKey = Deno.env.get("_SUPABASE_SERVICE_KEY") as string;
const supabase = createClient(supUrl, supKey);

if(!supUrl || !supKey){
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL environment variables');
  }

export default async function handler(req: Request): Promise<Response> {
  // Parse request body to decide which interval to run
  
  const { p_interval } = await req.json()

  const { error } = await supabase.rpc('evaluate_badges', { p_interval })
  if (error) {
    console.error(error)
    return new Response(`Badge evaluation failed for ${p_interval}`, { status: 500 })
  }
  return new Response(`Badge evaluation complete for ${p_interval}`, { status: 200 })
}

