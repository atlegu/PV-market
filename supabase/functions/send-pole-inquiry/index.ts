import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request body
    const { 
      poleId,
      ownerEmail,
      ownerName,
      inquirerEmail,
      inquirerName,
      poleDetails,
      message 
    } = await req.json()

    // Validate required fields
    if (!ownerEmail || !inquirerEmail || !poleDetails) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .pole-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .message-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #4299e1; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #4299e1; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ny forespørsel om stav</h1>
            </div>
            <div class="content">
              <p>Hei ${ownerName || 'der'},</p>
              
              <p>Du har mottatt en forespørsel om følgende stav:</p>
              
              <div class="pole-details">
                <h3>Stavdetaljer:</h3>
                <p><strong>Merke:</strong> ${poleDetails.brand}</p>
                <p><strong>Lengde:</strong> ${poleDetails.length}cm</p>
                <p><strong>Vekt:</strong> ${poleDetails.weight}lbs</p>
                ${poleDetails.location ? `<p><strong>Lokasjon:</strong> ${poleDetails.location}</p>` : ''}
              </div>
              
              ${message ? `
              <div class="message-box">
                <h3>Melding fra ${inquirerName || inquirerEmail}:</h3>
                <p>${message}</p>
              </div>
              ` : ''}
              
              <p><strong>Kontaktinformasjon:</strong></p>
              <p>Navn: ${inquirerName || 'Ikke oppgitt'}<br>
              E-post: ${inquirerEmail}</p>
              
              <p>Du kan svare direkte på denne e-posten eller bruke kontaktinformasjonen ovenfor.</p>
              
              <a href="mailto:${inquirerEmail}" class="button">Svar på forespørselen</a>
              
              <div class="footer">
                <p>Denne e-posten ble sendt via PV Market - Norges plattform for deling og salg av stavhopperstaver.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend (you need to set up Resend API key in Supabase secrets)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      // Fallback: Store inquiry in database instead
      const { error: dbError } = await supabaseClient
        .from('pole_inquiries')
        .insert({
          pole_id: poleId,
          owner_email: ownerEmail,
          inquirer_email: inquirerEmail,
          inquirer_name: inquirerName,
          message: message,
          created_at: new Date().toISOString()
        })
      
      if (dbError) throw dbError
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Forespørsel lagret. Eieren vil bli varslet.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PV Market <noreply@pvmarket.no>',
        to: ownerEmail,
        reply_to: inquirerEmail,
        subject: `Forespørsel om stav: ${poleDetails.brand} ${poleDetails.length}cm`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'E-post sendt!',
        id: data.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})