import {test} from 'node:test';
import assert from 'node:assert/strict';
import {multipleChoiceSchema,choiceIsCorrect,shuffledChoices} from '../lib/multiple-choice.ts';
import {makeCard,schedule,cardFormat,changeCardFormat} from '../lib/study.ts';
import {prepareEditedCards} from '../lib/card-edit.ts';
import {validateData} from '../lib/storage.ts';
import {readDraft} from '../lib/drafts.ts';
const quiz={options:['TCP','UDP','DNS','HTTP'],correctIndex:2};
test('Older cards can switch formats without losing their question or answer',()=>{
 const old=makeCard('Which resolves names?','DNS');
 assert.equal(cardFormat(old),'qa');
 const converted=changeCardFormat(old,'mcq');
 assert.equal(converted.id,old.id);assert.equal(converted.question,old.question);
 assert.equal(converted.multipleChoice?.options[0],'DNS');
 const cloze=changeCardFormat(old,'cloze');assert.equal(cardFormat(cloze),'cloze');assert.equal(cloze.answer,'DNS');
 assert.equal(cardFormat(makeCard('_____ resolves domain names.','DNS')),'cloze');
 const restored=changeCardFormat({...converted,multipleChoice:quiz,answer:'It resolves names.'},'qa');
 assert.equal(cardFormat(restored),'qa');assert.match(restored.answer,/DNS/);assert.match(restored.answer,/It resolves/);
 const data={decks:[{id:'d',title:'Legacy',description:'',source:'Notes',color:'mint',created:0,cards:[cloze]}],reviews:[],goal:20};
 assert.equal(validateData(data).decks[0].cards[0].format,'cloze');
});
test('Multiple choice requires four distinct non-empty options and a valid answer',()=>{
 assert.equal(multipleChoiceSchema.safeParse(quiz).success,true);
 for(const invalid of [{...quiz,options:['a','b']},{...quiz,options:['a',' A ','c','d']},{...quiz,options:['a','','c','d']},{...quiz,correctIndex:4},{...quiz,correctIndex:1.5}])assert.equal(multipleChoiceSchema.safeParse(invalid).success,false);
});
test('Shuffling preserves the answer identity and rejects invalid selections',()=>{
 const shuffled=shuffledChoices(quiz,()=>0);
 assert.notDeepEqual(shuffled.map(c=>c.text),quiz.options);
 assert.equal(shuffled.find(c=>choiceIsCorrect(quiz,c.index))?.text,'DNS');
 for(const index of [-1,1,4,NaN])assert.equal(choiceIsCorrect(quiz,index),false);
});
test('Editing options or correct answer resets mastery; unchanged cards keep progress',()=>{
 const card=schedule({...makeCard('Which resolves names?','DNS maps names to addresses.'),multipleChoice:quiz},'easy',100);
 assert.deepEqual(prepareEditedCards([card],[card]),[card]);
 for(const multipleChoice of [{...quiz,correctIndex:1},{...quiz,options:['TLS','UDP','DNS','HTTP']}]){
  const [edited]=prepareEditedCards([{...card,multipleChoice}],[card]);assert.equal(edited.state,'unseen');assert.equal(edited.due,0);
 }
 const {multipleChoice,...plain}=card;assert.equal(prepareEditedCards([plain],[card])[0].state,'unseen');
});
test('Account validation, backups and drafts preserve quizzes alongside legacy cards',()=>{
 const data={decks:[{id:'deck',title:'Networking',description:'',source:'Notes',color:'mint',created:1,cards:[{...makeCard('Which resolves names?','DNS maps names to addresses.'),multipleChoice:quiz},makeCard('Q','A')]}],reviews:[],goal:20};
 const restored=validateData(JSON.parse(JSON.stringify(data)));
 assert.deepEqual(restored.decks[0].cards[0].multipleChoice,quiz);
 assert.equal(restored.decks[0].cards[1].multipleChoice,undefined);
 assert.deepEqual(readDraft(JSON.stringify({data,revision:1,savedAt:100}))?.data,restored);
});
