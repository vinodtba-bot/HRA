// Verifies the identity header an AWS load balancer adds after a Cognito login (x-amzn-oidc-data).
// It is an ES256 JWT signed by the load balancer; the public key is fetched by key id from the
// regional endpoint. Runs in the middleware (edge runtime), so Web Crypto only.

const keyCache = new Map<string, CryptoKey>();

const b64urlToBytes = (s: string) => {
  const b64 = s.replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};
const b64urlJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

export type FetchKey = (url: string) => Promise<string>;
const fetchPem: FetchKey = async url => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`key fetch ${r.status}`);
  return r.text();
};

async function publicKey(region: string, kid: string, fetchKey: FetchKey) {
  if (!/^[\w-]+$/.test(kid) || !/^[a-z0-9-]+$/.test(region)) throw new Error('bad kid or region');
  const cached = keyCache.get(`${region}/${kid}`);
  if (cached) return cached;
  const pem = await fetchKey(`https://public-keys.auth.elb.${region}.amazonaws.com/${kid}`);
  const der = b64urlToBytes(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
  const key = await crypto.subtle.importKey('spki', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  keyCache.set(`${region}/${kid}`, key);
  return key;
}

/** Returns the signed-in user's email, or null if the header is missing, forged, expired or from another load balancer. */
export async function verifyAlbIdentity(token: string | null, albArn: string, now = Date.now(), fetchKey = fetchPem): Promise<string | null> {
  try {
    if (!token) return null;
    const [h, p, sig] = token.split('.');
    if (!h || !p || !sig) return null;
    const header = b64urlJson(h);
    if (header.alg !== 'ES256' || header.signer !== albArn) return null;
    const region = albArn.split(':')[3];
    const key = await publicKey(region, header.kid, fetchKey);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
    if (!ok) return null;
    const claims = b64urlJson(p);
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < now) return null;
    return typeof claims.email === 'string' ? claims.email : String(claims.sub ?? 'unknown');
  } catch {
    return null;
  }
}
