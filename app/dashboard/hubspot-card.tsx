import { createServerClient } from '@/lib/supabase-server';
import { searchContacts, searchDeals } from '@/lib/integrations/hubspot';
import Link from 'next/link';

export async function HubSpotCard({ tenantId }: { tenantId: string }) {
  const supabase = await createServerClient();
  const { data: cred } = await supabase
    .from('api_credentials')
    .select('hubspot_portal_id')
    .eq('tenant_id', tenantId)
    .eq('provider', 'hubspot')
    .maybeSingle();

  if (!cred) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="text-sm font-medium text-slate-200">HubSpot</div>
        <p className="mt-1 text-xs text-slate-500">Not connected</p>
        <Link
          href="/api/integrations/hubspot/authorize"
          className="mt-4 block w-full rounded-lg bg-orange-600 px-3 py-2 text-center text-xs font-medium text-white hover:bg-orange-500"
        >
          Connect HubSpot
        </Link>
      </div>
    );
  }

  let contactCount: number | null = null;
  let dealCount: number | null = null;
  let loadError: string | null = null;

  try {
    const [contacts, deals] = await Promise.all([
      searchContacts(tenantId, 1),
      searchDeals(tenantId, 1),
    ]);
    contactCount = contacts.total ?? 0;
    dealCount = deals.total ?? 0;
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load';
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-200">HubSpot</div>
        <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
          Connected
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Portal {cred.hubspot_portal_id}</p>

      {loadError ? (
        <p className="mt-3 text-xs text-red-400">{loadError}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-lg font-semibold text-white">{contactCount}</div>
            <div className="text-[10px] uppercase text-slate-500">Contacts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{dealCount}</div>
            <div className="text-[10px] uppercase text-slate-500">Deals</div>
          </div>
        </div>
      )}
    </div>
  );
}