import type {Card} from './study.ts';
export function prepareEditedCards(cards:Card[],original:Card[]=[]):Card[]{
 const previous=new Map(original.map(c=>[c.id,c]));
 return cards.map(c=>{const question=c.question.trim(),answer=c.answer.trim(),old=previous.get(c.id);const changed=old&&(question!==old.question||answer!==old.answer);return {...c,question,answer,...(changed?{interval:0,due:0,repetitions:0,state:'unseen' as const}:{})};});
}
