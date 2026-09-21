// NEED ELECTRO ERP & Customer Website — Edge Middleware
// Handles 301 redirects, canonical trailing slashes, and private route header security
import { NextResponse, type NextRequest } from 'next/server';

// Known 301 Permanent Redirects Map
const PERMANENT_REDIRECTS: Record<string, string> = {
  '/laptop': '/laptops',
  '/laptop/': '/laptops',
  '/computer': '/computers',
  '/security': '/cctv',
  '/cctv-camera': '/cctv',
  '/cctv-cameras': '/cctv',
  '/cctv/installation': '/services/cctv-installation',
  '/electrical': '/electrical-products',
  '/electrician': '/services/electrician',
  '/electricians': '/services/electrician',
  '/emi': '/laptop-emi',
  '/installments': '/laptop-emi',
  '/moulvibazar-laptop': '/moulvibazar',
  '/moulvibazar-computer': '/moulvibazar',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check Permanent 301 Redirects
  const redirectTarget = PERMANENT_REDIRECTS[pathname.toLowerCase()];
  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTarget;
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Trailing Slash normalization (strip trailing slash if not root and not file)
  if (pathname.length > 1 && pathname.endsWith('/') && !pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, { status: 301 });
  }

  // 3. Security & Anti-Indexing Headers on Private Administrative Routes
  const response = NextResponse.next();
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/erp') ||
    pathname.startsWith('/account')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
