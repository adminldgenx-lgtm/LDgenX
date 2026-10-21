import assert from 'node:assert/strict';
// Optional local QA: LDGENX_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-atlas-browser.mjs [origin]
const { chromium } = await import(process.env.LDGENX_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.argv[2] || 'http://127.0.0.1:4175';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const out=[];
try{for(const [lang,path] of [['fr','/applications'],['en','/en/applications']])for(const width of [1440,1024,820,768,390,320]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.setDefaultTimeout(7000);
 await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready);await page.locator('.atlas').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
 const get=()=>page.locator('.atlas').evaluate(root=>{const stage=root.querySelector('.atlas-stage').getBoundingClientRect();const labels=[...root.querySelectorAll('.atlas-label')].map(e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return{text:e.textContent,visible:cs.visibility!=='hidden'&&Number(cs.opacity)>.5,active:e.parentElement.hasAttribute('data-active'),x:r.x-stage.x,y:r.y-stage.y,w:r.width,h:r.height,font:cs.fontSize}});return{focused:root.hasAttribute('data-focused'),width:stage.width,height:stage.height,labels,link:root.querySelector('.atlas-card-link').getAttribute('href')}});
 const cases=[];cases.push({step:'overview',...await get()});
 for(let i=0;i<6;i++){
  if(width<=800){await page.locator('.atlas-chips button').nth(i).click()}else{await page.locator('.atlas-place').nth(i).evaluate(e=>e.click())}
  await page.waitForTimeout(100);cases.push({step:'focus-'+i,...await get()});
  if(i===1||i===4)await page.locator('.atlas').screenshot({path:`docs/qa-2026-10-20/atlas-focus-${lang}-${width}-${i}.png`});
  await page.keyboard.press('Escape');await page.waitForTimeout(100);cases.push({step:'overview-'+i,...await get()});
 }
 out.push({lang,width,cases});await page.close();console.log('Checked',lang,width);
}
await fs.writeFile('docs/qa-2026-10-20/atlas-geometry.json',JSON.stringify(out,null,2));
const issues=[];for(const row of out)for(const c of row.cases){const labels=c.labels.filter(l=>l.visible);for(const l of labels)if((l.active||row.width>800)&&(l.x<0||l.y<0||l.x+l.w>c.width+.1||l.y+l.h>c.height+.1))issues.push({lang:row.lang,width:row.width,step:c.step,problem:'clipped',label:l.text,box:l});for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)issues.push({lang:row.lang,width:row.width,step:c.step,problem:'overlap',a:a.text,b:b.text})}}
await fs.writeFile('docs/qa-2026-10-20/atlas-issues.json',JSON.stringify(issues,null,2));assert.deepEqual(issues, []); console.log('Passed: 156 atlas states; no clipped or overlapping labels.');
}finally{await browser.close()}
