// Optional local QA: LDGENX_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-atlas-motion-browser.mjs [origin]
const { chromium } = await import(process.env.LDGENX_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.argv[2] || 'http://127.0.0.1:4175';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[],errors=[];
try{for(const [lang,path] of [['fr','/applications'],['en','/en/applications']])for(const width of [1440,1024,390]){
 const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width<800,reducedMotion:'no-preference'});page.setDefaultTimeout(9000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready);await page.locator('.atlas').scrollIntoViewIfNeeded();await page.waitForTimeout(3300);
 const verify=async()=>{
  const result=await page.locator('.atlas').evaluate(root=>{
   const stage=root.querySelector('.atlas-stage').getBoundingClientRect(),active=root.querySelector('.atlas-place[data-active]'),l=active.querySelector('.atlas-label').getBoundingClientRect(),point=active.getBoundingClientRect(),leader=active.querySelector('.atlas-leader'),style=getComputedStyle(active);
   const lx=parseFloat(style.getPropertyValue('--label-x')),ly=parseFloat(style.getPropertyValue('--label-y'));
   return {label:active.getAttribute('aria-label'),fits:l.x>=stage.x-2&&l.y>=stage.y-2&&l.right<=stage.right+2&&l.bottom<=stage.bottom+2,attached:Math.abs(l.x-point.x-lx)<3&&Math.abs(l.y-point.y-ly)<3,leader:getComputedStyle(leader).width,link:root.querySelector('.atlas-card-link').getAttribute('href'),spin:getComputedStyle(root.querySelector('.atlas-rotor img')).animationName};
  });
  assert(result.fits,JSON.stringify({lang,width,...result}));assert(result.attached,'detached label');assert.equal(result.spin,'atlas-spin');return result;
 };
 const states=[];
 for(let i=0;i<6;i++){
  if(width<800)await page.locator('.atlas-chips button').nth(i).click();else await page.locator('.atlas-label').nth(i).click();
  await page.waitForTimeout(1450);states.push(await verify());
  if(i===5)await page.locator('.atlas').screenshot({path:`docs/qa-2026-10-20/atlas-motion-${lang}-${width}.png`});
  await page.keyboard.press('Escape');await page.waitForTimeout(1350);
 }
 // Existing next/previous controls and card links.
 await page.locator('.atlas-card-zoom').click();await page.waitForTimeout(1450);
 const first=await page.locator('.atlas-card-link').getAttribute('href');
 await page.locator('.atlas-card-steps button').last().click();await page.waitForTimeout(1450);
 assert.notEqual(await page.locator('.atlas-card-link').getAttribute('href'),first);
 await page.locator('.atlas-card-steps button').first().click();await page.waitForTimeout(1450);
 assert.equal(await page.locator('.atlas-card-link').getAttribute('href'),first);
 await page.keyboard.press('Escape');await page.waitForTimeout(1350);
 let dragged=false;
 if(width<800){
  await page.locator('.atlas-stage').scrollIntoViewIfNeeded();
  const stage=await page.locator('.atlas-stage').boundingBox(),before=await page.locator('.atlas-world').getAttribute('style');
  const cdp=await page.context().newCDPSession(page);const x=stage.x+width*.5,y=Math.min(stage.y+150,900);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let n=1;n<=5;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+22*n,y}]});await page.waitForTimeout(30)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
  dragged=before!==await page.locator('.atlas-world').getAttribute('style');assert(dragged,'map drag did not move');await verify();
 }
 results.push({lang,width,states,dragged});console.log('Passed normal motion',lang,width);await page.close();
}
assert.deepEqual(errors,[]);console.log('Passed: six normal-motion formats, six sectors, next/previous, Escape, label attachment and touch drag.');await fs.writeFile('docs/qa-2026-10-20/atlas-motion-results.json',JSON.stringify({results,errors},null,2));
}finally{await browser.close()}
