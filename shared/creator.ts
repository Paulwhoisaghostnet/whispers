/**
 * Resolve the creator wallet address for an objkt.com token or collection page URL.
 * Used to grant admin (delete) privileges to the token/collection creator.
 */

const OBJKT_GRAPHQL = "https://data.objkt.com/v3/graphql";

/**
 * Parse objkt.com page URL to extract token pk or FA (collection) contract.
 * Returns { type: 'token', pk } or { type: 'collection', contract } or null.
 */
export function parseObjktPageUrl(pageUrl: string): { type: "token"; pk: string } | { type: "collection"; contract: string } | null {
  try {
    const u = new URL(pageUrl);
    if (!u.hostname.endsWith("objkt.com")) return null;
    const path = u.pathname.replace(/\/$/, "");
    // e.g. /item/12345 or /collection/KT1...
    const itemMatch = path.match(/^\/item\/(\d+)$/);
    if (itemMatch) return { type: "token", pk: itemMatch[1] };
    const collMatch = path.match(/^\/collection\/(KT1[a-zA-Z0-9]+)$/);
    if (collMatch) return { type: "collection", contract: collMatch[1] };
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch creator address for the given token pk or collection contract from objkt.com API.
 * Returns the single primary creator address, or null if not found / error.
 */
export async function fetchCreatorAddress(pageUrl: string): Promise<string | null> {
  const parsed = parseObjktPageUrl(pageUrl);
  if (!parsed) return null;

  if (parsed.type === "token") {
    const query = `
      query TokenCreator($pk: bigint!) {
        token_by_pk(pk: $pk) {
          creators {
            holder {
              address
            }
          }
        }
      }
    `;
    const res = await fetch(OBJKT_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { pk: parsed.pk },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { token_by_pk?: { creators?: Array<{ holder?: { address?: string } }> } };
    };
    const creators = json.data?.token_by_pk?.creators;
    const first = creators?.[0]?.holder?.address;
    return first ?? null;
  }

  // collection: FA contract creator
  const query = `
    query FaCreator($contract: String!) {
      fa(contract: $contract) {
        creator_address
      }
    }
  `;
  const res = await fetch(OBJKT_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { contract: parsed.contract },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: { fa?: { creator_address?: string } };
  };
  return json.data?.fa?.creator_address ?? null;
}
