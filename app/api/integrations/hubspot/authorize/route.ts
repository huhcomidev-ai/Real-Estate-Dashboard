import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!user) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const scopes = [
    'oauth',
    'crm.objects.contacts.read',
    'crm.objects.companies.read',
    'crm.objects.deals.read',
  ].join(' ');

  const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.HUBSPOT_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.HUBSPOT_REDIRECT_URI!);
  authUrl.searchParams.set('scope', scopes);

  return NextResponse.redirect(authUrl.toString());
}
