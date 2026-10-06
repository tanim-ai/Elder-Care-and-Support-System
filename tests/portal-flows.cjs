const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const element = id => { if (!elements.has(id)) elements.set(id, {textContent:'', disabled:false, style:{}, dataset:{}, addEventListener(){}}); return elements.get(id); };
let reply = {success:false, error:'Unavailable'};
const notices = [];
const context = vm.createContext({
  document: {getElementById:element, addEventListener(){}, querySelector:()=>({value:'visa'}), createElement:()=>({textContent:'',innerHTML:''})},
  window:{location:{href:'http://localhost/Resident/caredirect-portal/index.html'}},
  URL, URLSearchParams, console, fetch:async()=>({json:async()=>reply}),
  showToast:message=>notices.push(message), alert:message=>notices.push(message), confirm:()=>true
});
vm.runInContext(fs.readFileSync('Resident/caredirect-portal/resident-api.js','utf8'),context);
(async()=>{
  await vm.runInContext('loadBilling()',context);
  assert.equal(element('payNowBtn').disabled,true);
  assert.equal(element('invoiceNote').textContent,'Unavailable');
  reply = {success:true,resident:{name:'Test'},invoice:{bill_id:7,status:'unpaid',billing_month:'2026-10-01',due_date:'2026-10-31',balance:'100'},history:[]};
  await vm.runInContext('loadBilling()',context);
  assert.equal(element('payNowBtn').disabled,false);
  reply = {success:false,error:'Payment declined'};
  element('payNowBtn').textContent='Pay Now';
  await vm.runInContext('payInvoice(document.getElementById("payNowBtn"))',context);
  assert.equal(element('payNowBtn').disabled,false);
  assert.match(notices.pop(),/Payment declined/);
  context.fetch = async()=>{throw Error('Network down');};
  await vm.runInContext('payInvoice(document.getElementById("payNowBtn"))',context);
  assert.equal(element('payNowBtn').disabled,false);
  await vm.runInContext('openEmergency()',context);
  assert.match(notices.pop(),/Could not send/);
  context.fetch=async url=>({json:async()=>String(url).includes('get_accommodation')?{success:true,service_code:'standard'}:{success:true,pending:true}});
  await vm.runInContext('loadPremiumUpgrade()',context);
  assert.equal(element('premiumUpgradeBtn').disabled,true);
  assert.match(element('premiumUpgradeBtn').textContent,/awaiting staff/);
  context.fetch=async url=>({json:async()=>String(url).includes('get_accommodation')?{success:true,service_code:'premium'}:{success:true,pending:false}});
  await vm.runInContext('loadPremiumUpgrade()',context);
  assert.equal(element('premiumUpgradeBtn').textContent,'Premium plan active');
  console.log('PASS: billing load, payment failure/retry, network failure, SOS failure, pending and active Premium states');
})().catch(error=>{console.error(error);process.exitCode=1});
