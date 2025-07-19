import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, inputType } = await req.json();

    if (!text || !targetLanguage) {
      throw new Error('Missing required parameters');
    }

    // Select model based on input type
    let model: string;
    switch (inputType) {
      case 'text':
        model = 'gpt-4.1-2025-04-14';
        break;
      case 'image':
        model = 'gpt-4.1-mini-2025-04-14';
        break;
      default:
        model = 'gpt-4.1-2025-04-14';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Your task is to:
1. Detect the source language of the input text
2. Translate the text accurately to ${targetLanguage}
3. Maintain the original meaning, tone, and context
4. Only return the translation, no explanations or additional text

Input type: ${inputType}`
          },
          {
            role: 'user',
            content: `Translate this text to ${targetLanguage}: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 500) {
        throw new Error('OpenAI service error. Please try again later.');
      } else {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return new Response(JSON.stringify({ 
      translatedText: data.choices[0].message.content.trim() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Translation failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});