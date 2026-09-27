export function inspectFields(fields,today=new Date().toISOString().slice(0,10)){
 const results=[]; const dates=['passportDob','visaDob','passportExpiry','visaExpiry'];
 for(const key of dates){if(fields[key]&&!validDate(fields[key]))results.push({field:key,result:'flagged',message:'Invalid calendar date'});}
 if(fields.passportDob&&fields.visaDob&&validDate(fields.passportDob)&&validDate(fields.visaDob))results.push({field:'birth_date',result:fields.passportDob===fields.visaDob?'passed':'flagged',message:fields.passportDob===fields.visaDob?'Entered birth dates agree':'Entered passport and visa birth dates differ'});
 if(fields.passportExpiry&&validDate(fields.passportExpiry))results.push({field:'expiry',result:fields.passportExpiry>=today?'passed':'flagged',message:fields.passportExpiry>=today?'Entered passport expiry has not passed':'Entered passport expiry has passed'});
 for(const key of ['passportDob','visaDob'])if(fields[key]&&validDate(fields[key])&&fields[key]>today)results.push({field:key,result:'flagged',message:'Birth date is in the future'});
 if(fields.passportName?.trim()&&fields.visaName?.trim()){const normalize=s=>s.trim().replace(/\s+/g,' ').toUpperCase();results.push({field:'name',result:normalize(fields.passportName)===normalize(fields.visaName)?'passed':'flagged',message:normalize(fields.passportName)===normalize(fields.visaName)?'Entered names agree':'Entered names differ; confirm spelling and source documents'});}
 return results;
}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function buildChecks(captures,fields){
 const docs=captures.filter(c=>c.kind==='document'&&!c.superseded),face=captures.some(c=>c.kind==='face'&&!c.superseded),validation=inspectFields(fields);
 const extracted=docs.map(c=>fields._ocr?.[c.document_type]).filter(r=>r&&docs.some(c=>c.id===r.captureId));const ocrComplete=docs.length>0&&extracted.length===docs.length&&extracted.every(r=>r.status==='extracted'&&r.confidence>=70);
 return [{id:'capture',label:'Required captures',state:docs.length&&face?'passed':'inconclusive',detail:docs.length&&face?'Document and face captures saved. Capture quality has not been assessed.':'Save at least one document and a face photograph.',basis:'Saved file presence only'},
 {id:'quality',label:'Capture quality',state:'not_performed',detail:'Automated blur, glare and completeness checks are not connected.',basis:'Officer must inspect the source capture'},
 {id:'ocr',label:'OCR text extraction',state:ocrComplete?'passed':extracted.length?'inconclusive':'not_performed',detail:extracted.length?extracted.length+' active document(s) scanned. '+(ocrComplete?'Basic fields read; compare them with the original.':'Missing fields or low confidence require review.'):'No OCR result for the active document. Upload or recapture it to scan.',basis:'Browser OCR candidates only; not authenticity verification'},
 {id:'validation',label:'Entered field validation',state:validation.some(r=>r.result==='flagged')?'flagged':validation.length?'passed':'not_performed',detail:validation.length?validation.map(r=>r.message).join('. '):'Enter document fields to check dates and cross-document consistency.',basis:'Rules applied to unverified extracted or manually entered values',evidence:validation},
 {id:'tampering',label:'Tampering screening',state:'not_performed',detail:'A validated tampering model is not connected.',basis:'Document authenticity has not been established'},
 {id:'face',label:'Face comparison and liveness',state:'not_performed',detail:face?'Live capture saved. Face comparison and liveness models are not connected.':'Live face capture required. Models are not connected.',basis:'Capturing a photograph does not prove liveness'},
 {id:'external',label:'External document status',state:'not_performed',detail:'No authorized issuer or document-status database is connected.',basis:'External status unknown'}];
}
export function canPass(checks){return Array.isArray(checks)&&['capture','quality','ocr','validation','tampering','face','external'].every(id=>checks.some(c=>c.id===id&&c.state==='passed'));}
export function fileType(bytes){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10')return 'image/png';const str=new TextDecoder().decode(bytes.slice(0,12));if(str.startsWith('%PDF-'))return 'application/pdf';if(str.startsWith('RIFF')&&str.slice(8)==='WEBP')return 'image/webp';return null;}
