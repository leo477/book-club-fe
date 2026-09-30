import { chromium } from '@playwright/test';
const ID='0ebcd8b0-9fae-4e28-a830-ee7f2bbae019';
const b = await chromium.launch();
for (const [n,u,bypass] of [['next','http://localhost:3100',false],['legacy','https://book-club-fe-dmytros-projects-ad22eb22.vercel.app',true]]) {
  const c = await b.newContext({baseURL:u,bypassCSP:bypass, viewport:{width:1280,height:900}});
  const p = await c.newPage();
  const reqs=[]; p.on('request',r=>{const x=new URL(r.url()); if(!/_next|\.(js|css|woff2?|png|svg)/.test(x.pathname)) reqs.push(r.method()+' '+x.host+x.pathname)});
  const errs=[]; p.on('console',m=>m.type()==='error'&&errs.push(m.text().slice(0,200)));
  await p.goto('/clubs/'+ID); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
  console.log(n, await p.title(), p.url()); console.log(reqs.join('\n')); console.log('ERR',errs);
  console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).join(',')));
  await p.screenshot({path:process.env.S+'/probe-'+n+'.png',fullPage:true});
  await c.close();
}
await b.close();
