import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@12.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { public_token, metadata } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const configuration = new Configuration({
      basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
        },
      },
    })

    const plaidClient = new PlaidApi(configuration)

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    })

    const access_token = tokenResponse.data.access_token
    const item_id = tokenResponse.data.item_id

    // Store the access token securely in the database
    const { error: dbError } = await supabaseClient
      .from('bank_connections')
      .insert({
        user_id: user.id,
        item_id: item_id,
        access_token: access_token,
        institution_name: metadata.institution?.name || 'Unknown',
        institution_id: metadata.institution?.institution_id,
        account_count: metadata.accounts?.length || 0,
      })

    if (dbError) throw dbError

    // Store account details
    if (metadata.accounts) {
      const accountsData = metadata.accounts.map((account: any) => ({
        user_id: user.id,
        item_id: item_id,
        account_id: account.id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
      }))

      await supabaseClient.from('bank_accounts').insert(accountsData)
    }

    return new Response(
      JSON.stringify({ success: true, item_id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})