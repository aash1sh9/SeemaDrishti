import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectFields,buildChecks,canPass,fileType} from '../server/checks.mjs';
test('invalid calendar dates and future birth dates are flagged',()=>{const results=inspectFields({passportDob:'2024-02-30',visaDob:'2030-01-01'},'2026-09-17');assert.equal(results.filter(x=>x.result==='flagged').length,2)});
test('cross-document mismatch and expiry remain distinct evidence',()=>{const r=inspectFields({passportDob:'1994-04-12',visaDob:'1995-04-12',passportExpiry:'2020-01-01'},'2026-09-17');assert.equal(r.length,2);assert.ok(r.every(x=>x.result==='flagged'));});
test('missing inputs and unavailable models never pass a case',()=>{const checks=buildChecks([],{ });assert.equal(checks[0].state,'inconclusive');assert.equal(canPass(checks),false);const withCaptures=buildChecks([{kind:'document'},{kind:'face'}],{passportDob:'1994-01-01',visaDob:'1994-01-01'});assert.equal(withCaptures[0].state,'passed');assert.equal(canPass(withCaptures),false);assert.equal(canPass([]),false);});
test('superseded captures do not satisfy required capture checks',()=>{assert.equal(buildChecks([{kind:'document',superseded:1},{kind:'face'}],{})[0].state,'inconclusive')});
test('file signature rejects renamed HTML uploads',()=>{assert.equal(fileType(new TextEncoder().encode('<html>unsafe</html>')),null);assert.equal(fileType(new Uint8Array([255,216,255,224])),'image/jpeg');assert.equal(fileType(new TextEncoder().encode('%PDF-1.4')),'application/pdf');});
