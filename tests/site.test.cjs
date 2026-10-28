const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const source = fs.readFileSync(__dirname + '/../assets/site.js', 'utf8');

function setup({response = {ok:true}, consent = 'accepted', host = 'nowdmc.com', networkError = false} = {}) {
  const handlers = {};
  const button = {disabled:false,textContent:'Send Enquiry'};
  const status = {textContent:'',className:'',focus(){}};
  let resets = 0, requests = 0;
  const form = {
    action:'https://formspree.io/f/mzzknwkd',
    addEventListener(name, fn){handlers[name] = fn;},
    querySelector(){return button;}, reportValidity(){return true;},
    setAttribute(){},removeAttribute(){},reset(){resets++;}
  };
  const appended = [];
  const document = {
    cookie:'',getElementById(id){return {enquiryForm:form,formStatus:status}[id] || null;},
    addEventListener(){},querySelectorAll(){return [];},
    createElement(){return {};},head:{appendChild(x){appended.push(x);}}
  };
  const window = {fetch:true,FormData:true,matchMedia(){return {addEventListener(){}};},addEventListener(){}};
  const context = {
    window,document,Date,console,
    location:{hostname:host,origin:'https://'+host,pathname:'/',hash:''},
    localStorage:{getItem(){return consent;},setItem(){}},
    FormData:class {get(name){return {destination:'Indonesia',name:'SECRET NAME',email:'secret@example.com',message:'CONFIDENTIAL BRIEF'}[name];}},
    fetch:async()=>{requests++;if(networkError)throw Error('network failed');return response;}
  };
  vm.runInNewContext(source,context);
  return {button,status,window,appended,run:()=>handlers.submit({preventDefault(){}}),get resets(){return resets;},get requests(){return requests;}};
}

(async()=>{
  const accepted=setup();await accepted.run();
  const events=accepted.window.dataLayer.filter(x=>x[0]==='event');
  assert.equal(events.length,1);assert.equal(events[0][1],'generate_lead');
  assert.equal(events[0][2].destination,'Indonesia');
  assert.equal(accepted.resets,1);assert.equal(accepted.requests,1);
  assert(!JSON.stringify(accepted.window.dataLayer).includes('SECRET'));
  assert(!JSON.stringify(accepted.window.dataLayer).includes('secret@example'));
  assert(!JSON.stringify(accepted.window.dataLayer).includes('CONFIDENTIAL'));

  const rejected=setup({response:{ok:false}});await rejected.run();
  assert.equal(rejected.resets,0);assert.equal(rejected.window.dataLayer.filter(x=>x[0]==='event').length,0);
  assert.match(rejected.status.textContent,/not accepted/);assert.equal(rejected.button.disabled,false);

  const network=setup({networkError:true});await network.run();
  assert.equal(network.resets,0);assert.match(network.status.textContent,/could not confirm receipt/);
  assert.equal(network.window.dataLayer.filter(x=>x[0]==='event').length,0);

  const declined=setup({consent:'declined'});await declined.run();
  assert.equal(declined.appended.length,0);assert.equal(declined.window.dataLayer,undefined);
  const unknown=setup({consent:null});assert.equal(unknown.appended.length,0);
  const local=setup({host:'127.0.0.1'});await local.run();assert.equal(local.appended.length,0);
  const double=setup();await Promise.all([double.run(),double.run()]);assert.equal(double.requests,1);
  console.log('PASS: accepted lead tracking, rejected and uncertain receipt, preserved input, duplicate-submit prevention, privacy, consent and localhost analytics exclusion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
