export const runtime = "edge";

export async function POST(req: Request) {
  const { text } = await req.json();
  
  // Get API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('API Key missing');
    return new Response(JSON.stringify({ 
      error: 'Configuration error - API key missing',
      debug: {
        envExists: !!process.env,
        keyExists: !!apiKey,
        env: process.env.NODE_ENV,
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        messages: [
          {
            role: "user",
            content: `Create a Mermaid flowchart diagram for: ${text}. 
            Important: Only output the diagram code, no explanatory text. Start with 'flowchart LR' or 'flowchart TB' and then directly list the nodes and connections.`
          }
        ],
        system: `You are a diagram generation expert specializing in Mermaid.js flowcharts.
        Rules:
        1. ONLY output valid Mermaid flowchart syntax
        2. Start with EXACTLY ONE flowchart declaration (either 'flowchart LR' or 'flowchart TB')
        3. Do not include any text like "Here is the diagram:" or "mermaid"
        4. Do not include multiple flowchart declarations
        5. Use proper arrow syntax (-->)
        6. Ensure there are no spaces in node IDs
        7. Use clear and concise labels
        8. Double-check syntax before responding`,
        max_tokens: 4096
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate diagram',
        details: data.error?.message || 'Unknown error',
        debug: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract and clean up the diagram text
    let diagramText = data.content[0].text.trim();
    
    // Remove any explanatory text or extra flowchart declarations
    diagramText = diagramText
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .replace(/^(Here is |This is |The )?([a-zA-Z\s]+)?diagram:?\s*/i, '')
      .replace(/flowchart\s+(LR|TB)[\s\S]*?(?=flowchart\s+(LR|TB))/g, '') // Remove all but the last flowchart
      .trim();
    
    // Ensure the diagram starts with a valid flowchart declaration
    if (!diagramText.startsWith('flowchart')) {
      diagramText = 'flowchart LR\n' + diagramText;
    }

    return new Response(JSON.stringify({ type: 'text', value: diagramText }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate diagram',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 