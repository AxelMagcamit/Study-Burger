import {authConfigured,authClient} from '@/lib/auth';
import {jsonPrivate,securityResponse} from '@/lib/security';
export async function GET(request:Request){if(!authConfigured())return jsonPrivate({configured:false,user:null});try{const auth=authClient(request);return auth.finish(jsonPrivate({configured:true,user:await auth.user()}));}catch(e){return securityResponse(e);}}
