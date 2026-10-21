// NEED ELECTRO ERP — SSRF Guard & URL Security Validator
import dns from 'node:dns/promises';
import { URL } from 'node:url';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
]);

/**
 * Checks if an IPv4 address falls within private or reserved CIDR ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;
  // 10.0.0.0/8 (Private network)
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (Private network)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16 (Private network)
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link-local / Cloud metadata)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 0.0.0.0/8 (Current network)
  if (parts[0] === 0) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  // 224.0.0.0/4 (Multicast)
  if (parts[0] >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or unique local.
 */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) {
    return true;
  }
  return false;
}

export interface UrlValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

/**
 * Validates an external image URL to prevent SSRF and protocol manipulation.
 */
export async function validateExternalImageUrl(rawUrl: string): Promise<UrlValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL is empty or invalid' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch (e) {
    return { valid: false, error: 'Malformed URL format' };
  }

  // 1. Only allow http and https protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: `Disallowed protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Block well-known cloud metadata & local hostnames
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, error: 'Access to local or cloud-internal hostname is forbidden' };
  }

  // 3. DNS resolution check to verify the IP does not resolve to private network
  try {
    const lookup = await dns.lookup(hostname, { all: true });
    if (!lookup || lookup.length === 0) {
      return { valid: false, error: 'Host DNS resolution yielded no records' };
    }

    for (const record of lookup) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        return { valid: false, error: `Host resolves to forbidden private IPv4 address: ${record.address}` };
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        return { valid: false, error: `Host resolves to forbidden private IPv6 address: ${record.address}` };
      }
    }
  } catch (dnsErr: any) {
    return { valid: false, error: `DNS lookup failed: ${dnsErr.message}` };
  }

  return {
    valid: true,
    sanitizedUrl: parsed.toString()
  };
}
