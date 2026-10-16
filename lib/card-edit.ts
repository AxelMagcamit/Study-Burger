import {cardFormat,type Card} from './study.ts';
import {multipleChoiceSchema} from './multiple-choice.ts';
export function prepareEditedCards(cards:Card[],original:Card[]=[]):Card[]{
 const previous=new Map(original.map(c=>[c.id,c]));
 return cards.map(c=>{const question=c.question.trim(),answer=c.answer.trim(),old=previous.get(c.id);const multipleChoice=c.multipleChoice?multipleChoiceSchema.parse(c.multipleChoice):undefined;const changed=old&&(cardFormat(c)!==cardFormat(old)||question!==old.question||answer!==old.answer||JSON.stringify(multipleChoice)!==JSON.stringify(old.multipleChoice));return {...c,question,answer,...(multipleChoice?{multipleChoice}:{}),...(changed?{interval:0,due:0,repetitions:0,state:'unseen' as const}:{})};});
}
