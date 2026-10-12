import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return ['study-burger-ponpon.vercel.app', 'study-burger-ponpon2.vercel.app'].map(host => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: 'https://study-burger.vercel.app/:path*',
      permanent: true,
    }));
  },
  async headers() {
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://vrkygytugewkxsbyzluy.supabase.co; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://*.supabase.co https://accounts.google.com";
    return [{source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
      {key:'X-Frame-Options',value:'DENY'},
      {key:'Strict-Transport-Security',value:'max-age=31536000'},
      {key:'Content-Security-Policy',value:csp}
    ]},...['/api/:path*','/auth/:path*'].map(source=>({source,headers:[{key:'Cache-Control',value:'private, no-store, max-age=0'}]}))];
  },
};

export default nextConfig;
