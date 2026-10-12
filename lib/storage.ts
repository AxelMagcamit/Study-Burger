import {z} from 'zod';
import type {Data} from './study.ts';
const card=z.object({id:z.string(),question:z.string().min(1).max(1500),answer:z.string().min(1).max(3000),interval:z.number().finite().min(0),due:z.number().finite().min(0),repetitions:z.number().int().min(0),state:z.enum(['unseen','learning','mastered'])});
export const dataSchema=z.object({decks:z.array(z.object({id:z.string(),title:z.string().min(1).max(120),description:z.string().max(300),source:z.string().max(500),color:z.enum(['mint','lavender','peach']),created:z.number().finite(),cards:z.array(card).max(2000)})).max(200),reviews:z.array(z.object({cardId:z.string(),deckId:z.string(),at:z.number().finite().min(0),rating:z.enum(['again','good','easy'])})).max(100000),goal:z.number().int().min(5).max(200)});
export const STORAGE_KEY='recallify-v1';
export function validateData(input:unknown):Data {const data=dataSchema.parse(input);const ids=data.decks.flatMap(d=>[d.id,...d.cards.map(c=>c.id)]);if(new Set(ids).size!==ids.length)throw new Error('Duplicate identifiers in backup.');return data;}
