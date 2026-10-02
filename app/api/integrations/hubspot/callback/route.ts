import { createServerClient as createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/vault';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard?hubspot_error=${error ?? 'missing_code'}`);
  }

  const tokenRes = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI!,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?hubspot_error=token_exchange_failed`);
  }

  const tokens = await tokenRes.json();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.redirect(`${origin}/dashboard?hubspot_error=no_tenant`);

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase.from('api_credentials').upsert(
    {
      tenant_id: profile.tenant_id,
      provider: 'hubspot',
      encrypted_payload: encrypt(tokens.access_token),
      refresh_token_encrypted: encrypt(tokens.refresh_token),
      token_expires_at: expiresAt,
      hubspot_portal_id: String(tokens.hub_id),
    },
    { onConflict: 'tenant_id,provider' }
  );

  return NextResponse.redirect(`${origin}/dashboard?hubspot_connected=true`);
}
