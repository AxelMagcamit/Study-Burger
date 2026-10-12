import {authRoute} from '@/lib/auth-route';
import {jsonPrivate} from '@/lib/security';
export async function GET(request:Request){return authRoute(request,async()=>jsonPrivate({ai:!!process.env.GEMINI_API_KEY}));}
