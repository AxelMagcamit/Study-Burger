import type {SupabaseClient} from '@supabase/supabase-js';
import {SecurityError} from './security';
export async function operation(client:SupabaseClient,name:string,payload:Record<string,unknown>){
  const {data,error}=await client.rpc('study_operation',{operation:name,payload});
  if(error){
    const status=/^PT(400|401|409|413|429)$/.test(error.code)?Number(error.code.slice(2)):503;
    throw new SecurityError(status===503?'Account storage is temporarily unavailable. Please retry.':error.message,status);
  }
  return data as Record<string,unknown>;
}
export async function reserveAI(client:SupabaseClient,cost:number){
  const {token}=await operation(client,'reserve',{cost});
  return async()=>{await operation(client,'release',{token});};
}
