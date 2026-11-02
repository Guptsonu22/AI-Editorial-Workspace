// ==============================================================================
// SSRF (Server-Side Request Forgery) Defense Validator
// Protects the server from internal network scanning and cloud metadata access
// ==============================================================================

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "169.254.169.254", // AWS/GCP/Azure instance metadata
  "metadata.google.internal",
  "metadata",
]);

// IPv4 CIDR check helpers
function ipToNumber(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isInRange(ip: string, subnet: string, maskBits: number): boolean {
  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);
  const mask = ((1 << maskBits) - 1) << (32 - maskBits);
  return (ipNum & mask) === (subnetNum & mask);
}

export function isPrivateIp(ip: string): boolean {
  // Check common IPv4 private ranges
  if (/^127\./.test(ip)) return true; // Loopback
  if (/^10\./.test(ip)) return true; // 10.0.0.0/8
  if (/^192\.168\./.test(ip)) return true; // 192.168.0.0/16
  if (/^169\.254\./.test(ip)) return true; // Link-local
  if (/^0\./.test(ip)) return true;

  // 172.16.0.0/12 range check
  try {
    if (isInRange(ip, "172.16.0.0", 12)) return true;
  } catch {
    // If not standard IPv4, proceed
  }

  // IPv6 loopback and link-local
  if (ip === "::1" || ip.toLowerCase().startsWith("fe80:") || ip.toLowerCase().startsWith("fc00:")) {
    return true;
  }

  return false;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedUrl?: URL;
  error?: string;
}

export function validateSafeUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "URL string is empty or invalid." };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, error: "Malformed URL format. Include http:// or https://" };
  }

  // 1. Protocol validation: Only http and https permitted
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      error: `Protocol '${parsed.protocol}' is prohibited. Only http: and https: are allowed.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Direct hostname check against blacklisted internal names
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      isValid: false,
      error: "Access to loopback or cloud metadata services is strictly blocked.",
    };
  }

  // 3. Raw IP check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIp(hostname)) {
      return {
        isValid: false,
        error: "Access to private or local network IP addresses is restricted.",
      };
    }
  }

  // 4. Port safety check: Disallow internal ports (SSH, Redis, Postgres, etc.)
  if (parsed.port) {
    const port = parseInt(parsed.port, 10);
    const ALLOWED_PORTS = [80, 443, 8080, 8443];
    if (!ALLOWED_PORTS.includes(port)) {
      return {
        isValid: false,
        error: `Custom port :${port} is prohibited for security compliance.`,
      };
    }
  }

  return { isValid: true, sanitizedUrl: parsed };
}
