
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Extract image text function called');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const { base64Image } = await req.json();
    console.log('Image received for text extraction');

    // Enhanced input validation
    if (!base64Image) {
      throw new Error('Missing base64Image parameter');
    }

    if (typeof base64Image !== 'string') {
      throw new Error('Invalid parameter type');
    }

    // Validate base64 format and reasonable size (max ~10MB base64)
    if (base64Image.length > 14000000) {
      throw new Error('Image size exceeds maximum limit');
    }

    // Basic base64 validation
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Image)) {
      throw new Error('Invalid base64 format');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all readable text from this image. Return only the text content, no explanations or formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`Failed to process image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content?.trim() || '';
    console.log('Text extraction successful');

    return new Response(JSON.stringify({ 
      extractedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Image text extraction error:', error);
    
    // Generic error message for security
    const isClientError = error instanceof Error && (
      error.message.includes('Missing base64Image parameter') ||
      error.message.includes('Invalid parameter type') ||
      error.message.includes('Image size exceeds') ||
      error.message.includes('Invalid base64 format')
    );
    
    const errorMessage = isClientError ? error.message : "Image processing service temporarily unavailable";
    const statusCode = isClientError ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Window': '3600'
      },
    });
  }
});
