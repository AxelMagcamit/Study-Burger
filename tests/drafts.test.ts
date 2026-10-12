import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readDraft,draftKey,accountBytes} from '../lib/drafts.ts';
import {seedData} from '../lib/study.ts';
test('Unsent drafts preserve the account revision and all cards',()=>{const data=seedData();const draft={data,revision:7,savedAt:123};assert.deepEqual(readDraft(JSON.stringify(draft)),draft);assert.notEqual(draftKey('account-a'),draftKey('account-b'));});
test('Corrupt or invalid draft data is never restored',()=>{for(const raw of [null,'bad','{}',JSON.stringify({data:seedData(),revision:-1,savedAt:123}),JSON.stringify({data:{},revision:1,savedAt:123})])assert.equal(readDraft(raw),null);});
test('Storage capacity counts UTF-8 bytes, not JavaScript characters',()=>{const data=seedData();data.decks[0].cards[0].answer='記憶'.repeat(100);assert.equal(accountBytes(data),Buffer.byteLength(JSON.stringify(data)));assert.ok(accountBytes(data)>JSON.stringify(data).length);});
