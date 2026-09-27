import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const noStorage={DB:{prepare(){throw new Error('Public demo must not read officer storage')}},BUCKET:{get(){throw new Error('Public demo must not read officer captures')}}};
test('judge entry serves without a session or storage access',async()=>{const r=await worker.fetch(new Request('https://example.test/judge'),noStorage);assert.equal(r.status,200);const html=await r.text();assert.match(html,/judge-demo.js/);assert.match(html,/workspace.js/);});
test('anonymous visitor cannot read officer case records or capture files',async()=>{for(const path of ['/api/cases','/api/cases/SD-private','/api/captures/private-file','/api/me']){const r=await worker.fetch(new Request('https://example.test'+path),noStorage);assert.equal(r.status,401,path)}});
test('anonymous visitor cannot create an officer session',async()=>{const r=await worker.fetch(new Request('https://example.test/api/login',{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json'},body:'{}'}),noStorage);assert.equal(r.status,401);});
test('signed-in visitor without enrollment authorization cannot create an officer profile',async()=>{const db={prepare(){return {bind(){return {first:async()=>null}}}}};const r=await worker.fetch(new Request('https://example.test/api/login',{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json','oai-authenticated-user-id':'visitor','oai-authenticated-user-email':'visitor@example.test'},body:JSON.stringify({name:'Visitor',officerCode:'NO-ACCESS',checkpoint:'Unknown'})}),{DB:db,BUCKET:{},OFFICER_EMAIL_ALLOWLIST:'owner@example.test'});assert.equal(r.status,403);});

test('root entry is public and needs no officer storage',async()=>{const r=await worker.fetch(new Request('https://example.test/'),noStorage);assert.equal(r.status,200);});
