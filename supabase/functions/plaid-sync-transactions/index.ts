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

    // Get all bank connections for the user
    const { data: connections } = await supabaseClient
      .from('bank_connections')
      .select('*')
      .eq('user_id', user.id)

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bank connections found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

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
    let allTransactions = []

    for (const connection of connections) {
      try {
        const response = await plaidClient.transactionsSync({
          access_token: connection.access_token,
        })

        const transactions = response.data.added.map((t: any) => ({
          user_id: user.id,
          plaid_transaction_id: t.transaction_id,
          account_id: t.account_id,
          amount: t.amount,
          date: t.date,
          name: t.name,
          merchant_name: t.merchant_name,
          category: t.category?.[0] || 'Other',
          subcategory: t.category?.[1] || null,
          pending: t.pending,
          iso_currency_code: t.iso_currency_code,
          is_tax_deductible: false,
          needs_review: true,
        }))

        if (transactions.length > 0) {
          await supabaseClient
            .from('transactions')
            .upsert(transactions, { onConflict: 'plaid_transaction_id' })
          
          allTransactions = [...allTransactions, ...transactions]
        }
      } catch (error) {
        console.error(`Error syncing transactions for connection ${connection.item_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions_synced: allTransactions.length 
      }),
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