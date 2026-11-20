# ZOVO — connected starter

This version connects the demo storefront to the ZOVO Supabase project for email/password authentication and seller shop creation.

## Files
- `index.html`
- `styles.css`
- `app.js`

## Important
- Supabase URL and publishable key are configured in `app.js`. Publishable keys are intended for browser use; never put a Supabase secret key or database password in frontend code.
- Database tables and Row Level Security policies must already exist.
- Email confirmation may need to be completed before the user is logged in, depending on Supabase Auth settings.
- Product cards, cart, checkout and payments remain demo-only. No real payments or order fulfilment are enabled.
- Before public launch, review authentication, RLS policies, spam protection, seller verification, and privacy/legal requirements.
