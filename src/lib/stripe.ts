import { supabase } from './supabase';

export const STRIPE_PRICE_IDS = {
  weekly: 'price_xxx',
  monthly: 'price_yyy',
  annual: 'price_zzz'
};


export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  email: string
) => {
  const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
    body: {
      priceId,
      userId,
      email,
      successUrl: `${window.location.origin}/profile?session=success`,
      cancelUrl: `${window.location.origin}/profile?session=canceled`
    }
  });

  if (error) throw error;
  return data;
};

export const manageSubscription = async (
  action: 'cancel' | 'reactivate' | 'upgrade' | 'downgrade',
  userId: string,
  newPriceId?: string
) => {
  const { data, error } = await supabase.functions.invoke('manage-subscription', {
    body: { action, userId, newPriceId }
  });

  if (error) throw error;
  return data;
};

export const getSubscriptionDetails = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_current_period_end, subscription_cancel_at_period_end')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};


export const getInvoices = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return [];
  }
};
