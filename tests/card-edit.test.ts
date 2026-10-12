import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareEditedCards} from '../lib/card-edit.ts';
import {makeCard,schedule} from '../lib/study.ts';
test('Changing an answer resets its previous mastery and due date',()=>{let c=makeCard('Question','Old answer');for(let i=0;i<3;i++)c=schedule(c,'easy',1);const [edited]=prepareEditedCards([{...c,answer:'New answer'}],[c]);assert.equal(edited.state,'unseen');assert.equal(edited.due,0);assert.equal(edited.repetitions,0);assert.equal(edited.interval,0);assert.equal(edited.id,c.id);assert.equal(c.state,'mastered');});
test('Unchanged and whitespace-only edits keep review progress',()=>{const c=schedule(makeCard('Question','Answer'),'good',100);assert.deepEqual(prepareEditedCards([{...c,question:'  Question  '}],[c]),[c]);});
