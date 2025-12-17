# Stripe Payment Integration Setup Guide

## Overview
SmartBooks24 now has complete Stripe payment integration for subscription management, including checkout sessions, subscription lifecycle management, and webhook handling.

## Features Implemented
- ✅ Subscription checkout with Stripe
- ✅ Monthly and Annual pricing plans
- ✅ Subscription management (cancel, reactivate, upgrade/downgrade)
- ✅ Webhook handling for subscription lifecycle events
- ✅ Invoice tracking and billing history
- ✅ Customer portal integration
- ✅ Subscription status tracking in database

## Stripe Configuration Required

### 1. Create Stripe Products and Prices
In your Stripe Dashboard (https://dashboard.stripe.com):

1. Go to **Products** → **Add Product**
2. Create two products:
   - **Weekly Plan**: $6.99/week
   - **Monthly Plan**: $24.99/month
   - **Annual Plan**: $249/year

3. After creating, copy the Price IDs and update `src/lib/stripe.ts`:
```typescript
export const STRIPE_PRICE_IDS = {
  monthly: 'price_xxxxxxxxxxxxx', // Replace with your monthly price ID
  annual: 'price_xxxxxxxxxxxxx'  // Replace with your annual price ID
};
```

### 2. Configure Webhook Endpoint
1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Set endpoint URL to: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
4. Copy the **Signing Secret** (starts with `whsec_`)

### 3. Add Stripe Webhook Secret to Supabase
The STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY are already configured.

You need to add the webhook secret:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Testing the Integration

### Test Mode
1. Use Stripe test mode keys for development
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to YOUR_SUPABASE_URL/functions/v1/stripe-webhook
```

## User Flow

### New Subscription
1. User clicks "Subscribe" on pricing page or profile
2. Redirected to Stripe Checkout
3. After payment, redirected back to `/profile?session=success`
4. Webhook updates database with subscription details
5. User sees active subscription in profile

### Subscription Management
- **Cancel**: Sets `cancel_at_period_end` to true, access continues until period ends
- **Reactivate**: Removes cancellation, subscription continues
- **Upgrade/Downgrade**: Changes plan with prorated billing

## Database Schema
Tables created for subscription tracking:
- `profiles`: Added subscription fields (status, plan, customer_id, etc.)
- `subscriptions`: Full subscription history
- `invoices`: Billing history and receipts

## Edge Functions

### create-subscription-checkout
Creates Stripe checkout session for new subscriptions.

### manage-subscription
Handles subscription actions: cancel, reactivate, upgrade, downgrade.

### stripe-webhook
Processes Stripe webhook events and updates database.

## Production Checklist
- [ ] Replace test Stripe keys with live keys
- [ ] Update STRIPE_PRICE_IDS with live price IDs
- [ ] Configure live webhook endpoint
- [ ] Add STRIPE_WEBHOOK_SECRET to Supabase secrets
- [ ] Test complete subscription flow
- [ ] Verify webhook events are processed
- [ ] Test cancellation and reactivation
- [ ] Verify invoice generation

## Support
For issues with Stripe integration, check:
1. Supabase edge function logs
2. Stripe webhook dashboard for delivery status
3. Database tables for subscription data
