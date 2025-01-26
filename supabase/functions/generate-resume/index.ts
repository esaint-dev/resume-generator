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
    const { jobDescription } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume writer. Generate a professional resume based on the provided job description. 
            Format the resume in the following structure:

            [Full Name]
            [Job Title]

            CONTACT
            - Email: [appropriate email]
            - Phone: [appropriate phone]
            - Location: [appropriate location]
            - LinkedIn: [appropriate LinkedIn URL]

            SKILLS
            - [Skill 1]
            - [Skill 2]
            - [Skill 3]
            (List 5-7 relevant skills)

            ACHIEVEMENTS
            - [Achievement 1]
            - [Achievement 2]
            - [Achievement 3]
            (List 3-4 significant achievements)

            PROFILE
            [Write a compelling professional summary in 3-4 sentences]

            WORK EXPERIENCE
            [Company Name] | [Location]
            [Job Title] | [Date Range]
            - [Responsibility/Achievement 1]
            - [Responsibility/Achievement 2]
            - [Responsibility/Achievement 3]
            (Include 2-3 relevant positions)

            EDUCATION
            [Institution Name] | [Location]
            [Degree/Certification] | [Date Range]
            - [Relevant coursework or achievements]

            Make it relevant to the job description while keeping it professional and impactful.`
          },
          { role: 'user', content: `Generate a resume for this job description: ${jobDescription}` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error?.error?.message || 'Failed to generate resume');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI API response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedResume = data.choices[0].message.content;

    return new Response(JSON.stringify({ resume: generatedResume }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-resume function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});