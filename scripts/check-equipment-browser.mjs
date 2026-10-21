// Optional local QA: LDGENX_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-equipment-browser.mjs [origin]
const { chromium } = await import(process.env.LDGENX_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.argv[2] || 'http://127.0.0.1:4175';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[],errors=[],retired=/\/(?:laboratoire|sequencage|microbiologie|dna-ecotrace|conception|agriculture|recherche|innovation|aquaculture)-\d+\.webp/;
try{for(const lang of ['fr','en'])for(const width of [1440,390]){
 const prefix=lang==='fr'?'':'/en';const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.setDefaultTimeout(9000);page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(origin+prefix+'/services');await page.evaluate(()=>document.fonts.ready);
 const steps=page.locator('.workflow-step');
 for(let i=0;i<7;i++){
  await steps.nth(i).scrollIntoViewIfNeeded();
  const image=width<800?steps.nth(i).locator('img'):page.locator('.workflow-photo .photo-stack-layer').nth(i).locator('img');
  await image.evaluate(e=>e.loading='eager');await image.evaluate(e=>e.decode());
  assert(await image.evaluate(e=>e.naturalWidth>0));
  if(i===0||i===3)await (width<800?steps.nth(i):page.locator('.workflow-sticky')).screenshot({path:`docs/qa-2026-10-20/workflow-${lang}-${width}-${i}.png`});
 }
 // The existing selector still moves to the chosen stage.
 const picker=page.locator(width<800?'.workflow-mobile-picker select':'.workflow-desktop-picker select');
 await picker.selectOption('3');await page.waitForTimeout(120);assert(await steps.nth(3).evaluate(e=>e.classList.contains('is-active')));
 await page.goto(origin+(prefix||'/'));await page.locator('.dna-process').scrollIntoViewIfNeeded();
 for(const image of await page.locator('.dna-static-steps img').all()){await image.evaluate(e=>e.loading='eager');await image.evaluate(e=>e.decode())}
 assert.equal(await page.locator('.dna-static-steps .dna-stage').count(),7);
 await page.locator('.dna-static-steps').screenshot({path:`docs/qa-2026-10-20/dna-${lang}-${width}.png`});
 // Menus: all previews, not just the initial image, remain available.
 if(width>800){
  await page.evaluate(()=>scrollTo(0,0));
  for(const menu of ['services','applications']){
   const button=page.locator(`.site-header button[aria-controls="mega-${menu}"]`);
   await button.click();await page.waitForTimeout(150);
   const previews=page.locator('.mega-menu img[data-image]');
   for(const image of await previews.all()){await image.evaluate(e=>e.loading='eager');await image.evaluate(e=>e.decode())}
   assert(await previews.count()>0,'missing menu previews');
   for(const link of await page.locator('.mega-links a').all()){await link.hover();await page.waitForTimeout(35);assert.equal(await page.locator('.mega-feature .photo-stack-layer[data-active]').count(),1)}
   await page.locator('.mega-menu').screenshot({path:`docs/qa-2026-10-20/menu-${menu}-${lang}.png`});
   await page.keyboard.press('Escape');
  }
 }
 assert(!requests.some(u=>retired.test(u)),'retired image requested');
 results.push({lang,width,workflowSteps:7,dnaStages:7,retiredRequests:0});console.log('Passed workflow/DNA/menu',lang,width);await page.close();
}
assert.deepEqual(errors,[]);await fs.writeFile('docs/qa-2026-10-20/journey-results.json',JSON.stringify({results,errors},null,2));
}finally{await browser.close()}
