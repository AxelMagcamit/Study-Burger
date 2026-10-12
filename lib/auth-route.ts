import {authClient,type AccountUser} from './auth';
import {requireIdentity,SecurityError,securityResponse} from './security';
import {errorResponse} from './ai';
export async function authRoute(request:Request,action:(user:AccountUser,client:ReturnType<typeof authClient>['client'])=>Promise<Response>){let auth:ReturnType<typeof authClient>|undefined;try{auth=authClient(request);const user=requireIdentity(await auth.user());return auth.finish(await action(user,auth.client));}catch(e){const response=e instanceof SecurityError?securityResponse(e):errorResponse(e);return auth?auth.finish(response):response;}}
