import { createServerClient } from '@/lib/supabase-server';
import { decrypt, encrypt } from '@/lib/vault';

async function getValidAccessToken(tenantId: string): Promise<string> {
  const supabase = await createServerClient();

  const { data: cred, error } = await supabase
    .from('api_credentials')
    .select('encrypted_payload, refresh_token_encrypted, token_expires_at')
    .eq('tenant_id', tenantId)
    .eq('provider', 'hubspot')
    .single();

  if (error || !cred) throw new Error('HubSpot not connected for this tenant');

  const expiresAt = new Date(cred.token_expires_at).getTime();
  const now = Date.now();

  if (expiresAt - now < 5 * 60 * 1000) {
    const refreshToken = decrypt(cred.refresh_token_encrypted);

    const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      await supabase
        .from('api_credentials')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('provider', 'hubspot');
      throw new Error('HubSpot refresh failed — please reconnect');
    }

    const tokens = await res.json();
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase
      .from('api_credentials')
      .update({
        encrypted_payload: encrypt(tokens.access_token),
        refresh_token_encrypted: encrypt(tokens.refresh_token),
        token_expires_at: newExpiresAt,
      })
      .eq('tenant_id', tenantId)
      .eq('provider', 'hubspot');

    return tokens.access_token;
  }

  return decrypt(cred.encrypted_payload);
}

export async function hubspotFetch(tenantId: string, path: string, init?: RequestInit) {
  const token = await getValidAccessToken(tenantId);

  const res = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
    await new Promise((r) => setTimeout(r, waitMs));
    return hubspotFetch(tenantId, path, init);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot API ${res.status}: ${body}`);
  }

  return res.json();
}

export async function searchContacts(tenantId: string, limit = 20) {
  return hubspotFetch(tenantId, '/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({ limit, properties: ['email', 'firstname', 'lastname'] }),
  });
}

export async function searchDeals(tenantId: string, limit = 20) {
  return hubspotFetch(tenantId, '/crm/v3/objects/deals/search', {
    method: 'POST',
    body: JSON.stringify({ limit, properties: ['dealname', 'amount', 'closedate'] }),
  });
}