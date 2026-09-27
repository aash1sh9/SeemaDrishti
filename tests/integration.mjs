import assert from 'node:assert/strict';
const base='http://127.0.0.1:4173',suffix=Date.now();
const a={user:'integration-a-'+suffix,cookie:''},b={user:'integration-b-'+suffix,cookie:''};
async function request(actor,path,method='GET',data,expected=200){const headers={'oai-authenticated-user-id':actor.user,Origin:base};if(actor.cookie)headers.Cookie=actor.cookie;let body;if(data instanceof FormData)body=data;else if(data!==undefined){body=JSON.stringify(data);headers['Content-Type']='application/json';}const r=await fetch(base+'/api'+path,{method,headers,body});const cookie=r.headers.get('Set-Cookie');if(cookie)actor.cookie=cookie.split(';')[0];let result;if(r.headers.get('Content-Type')?.includes('application/json'))result=await r.json();else result=await r.arrayBuffer();assert.equal(r.status,expected,JSON.stringify(result));return result;}
await request(a,'/cases','GET',undefined,401);
await request(a,'/login','POST',{name:'Integration Officer A',officerCode:'TEST-A-'+suffix,checkpoint:'Local automated tests'});
assert.equal((await request(a,'/cases')).cases.length,0);
const c=await request(a,'/cases','POST',{travellerName:'Fictional Test Traveller'},201);
await request(a,`/cases/${c.id}/fields`,'POST',{passportName:'Fictional Test Traveller',passportDob:'1994-04-12',visaDob:'1995-04-12',passportExpiry:'2034-01-01'});
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5xoAAAAASUVORK5CYII=','base64');
async function upload(actor,kind='document',source='upload'){const f=new FormData();f.append('file',new Blob([png],{type:'image/png'}),'test-fixture.png');f.append('kind',kind);f.append('source',source);f.append('documentType',kind==='face'?'face':'passport');return request(actor,`/cases/${c.id}/captures`,'POST',f,201)}
const cap=await upload(a);await request(a,`/captures/${cap.id}`);
await upload(a,'face','camera');
const checks=await request(a,`/cases/${c.id}/checks`,'POST',{});assert.equal(checks.checks.find(x=>x.id==='validation').state,'flagged');assert.equal(checks.checks.find(x=>x.id==='face').state,'not_performed');assert.equal(checks.checksStale,false);
await request(a,`/cases/${c.id}/decision`,'POST',{action:'pass',reason:'Should be rejected by required checks'},409);
await request(a,`/cases/${c.id}/decision`,'POST',{action:'supervisor',reason:'Birth date discrepancy needs a supervisor review.'});
await request(b,'/login','POST',{name:'Integration Officer B',officerCode:'TEST-B-'+suffix,checkpoint:'Local automated tests'});
assert.equal((await request(b,'/cases')).cases.length,0);
await request(b,`/cases/${c.id}`,'GET',undefined,404);await request(b,`/captures/${cap.id}`,'GET',undefined,404);
await request(b,`/cases/${c.id}/decision`,'POST',{action:'note',reason:'Unauthorized action'},404);
await request(a,'/logout','POST',{});await request(a,'/cases','GET',undefined,401);
await request(a,'/login','POST',{});assert.equal((await request(a,'/cases')).cases[0].status,'supervisor_review');
await request(a,`/cases/${c.id}/fields`,'POST',{passportName:'Fictional Test Traveller',passportDob:'1994-04-12',visaDob:'1994-04-12'});assert.equal((await request(a,`/cases/${c.id}`)).checksStale,true);
await upload(a);const updated=await request(a,`/cases/${c.id}`);assert.equal(updated.captures.filter(x=>x.kind==='document'&&!x.superseded).length,1);assert.equal(updated.captures.filter(x=>x.kind==='document'&&x.superseded).length,1);
const bad=new FormData();bad.append('file',new Blob(['<html>bad</html>'],{type:'image/png'}),'fake.png');bad.append('kind','document');bad.append('source','upload');bad.append('documentType','passport');await request(a,`/cases/${c.id}/captures`,'POST',bad,400);
const csrf=await fetch(base+'/api/cases',{method:'POST',headers:{Origin:'https://untrusted.example','oai-authenticated-user-id':a.user,Cookie:a.cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(csrf.status,403);
console.log('PASS: login, empty accounts, saved cases, file storage, field checks, incomplete-pass blocking, account isolation, logout, persistence, stale results, capture versioning, file rejection, CSRF rejection.');

const active=updated.captures.find(x=>x.kind==='document'&&!x.superseded);
await request(a,'/cases/'+c.id+'/ocr','POST',{captureId:cap.id,text:'PASSPORT'},409);
await request(b,'/cases/'+c.id+'/ocr','POST',{captureId:active.id,text:'PASSPORT'},404);
await request(a,'/cases/'+c.id+'/ocr','POST',{captureId:active.id,text:'PASSPORT\nName: SAMPLE PERSON\nDate of birth: 12 APR 1994\nPassport no: X1234567',confidence:90});
const extracted=await request(a,'/cases/'+c.id);assert.equal(extracted.fields.passportName,'SAMPLE PERSON');assert.equal(extracted.fields.passportDob,'1994-04-12');assert.equal(extracted.fields._ocr.passport.captureId,active.id);
await request(a,'/cases/'+c.id+'/fields','POST',{...extracted.fields,passportName:'CORRECTED PERSON',_ocr:{}});assert.equal((await request(a,'/cases/'+c.id)).fields._ocr.passport.manuallyEdited,true);
await request(a,'/cases/'+c.id+'/civilian','POST',{fullName:'Stated Sample Name',source:'civilian_statement',birthDate:'1994-04-12'});const withCivilian=await request(a,'/cases/'+c.id);assert.equal(withCivilian.civilian.verified,false);assert.equal(withCivilian.fields.passportName,'CORRECTED PERSON');
await request(a,'/cases/'+c.id+'/civilian','POST',{fullName:'Bad source',source:'verified_database'},400);
await request(b,'/cases/'+c.id+'/civilian','POST',{fullName:'No access',source:'civilian_statement'},404);
console.log('PASS: OCR ownership, active-capture binding, extracted field persistence, preserved OCR provenance, separate unverified civilian records.');
