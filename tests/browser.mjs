// Optional visual acceptance. Bring an existing Playwright installation and browser.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2] || 'playwright');
const browserPath = process.argv[3];
const output = path.resolve('.qa/rendered');
fs.mkdirSync(output, {recursive:true});
const files = [];
for (const [folder, prefix] of [['Structured CV example - Alisa Petrova','example'],['Structured CV template','template']]) {
  for (const profile of ['mba','team-lead']) for (const theme of ['classic','editorial']) {
    files.push({id:`${prefix}-${profile}-${theme}`,file:path.resolve(folder,'exports',`${profile}-${theme}.html`)});
  }
}
files.push({id:'single-example',file:path.resolve('Single file example - Alisa Petrova CV/cv.html')});
files.push({id:'single-template',file:path.resolve('Single file template - your CV/cv.html')});
const browser = await chromium.launch({headless:true,executablePath:browserPath,timeout:20_000});
const report=[];
try {
  const context=await browser.newContext({viewport:{width:1120,height:1000},offline:true});
  const page=await context.newPage();
  page.setDefaultTimeout(15_000);
  const network=[];
  page.on('request',req=>{if(/^https?:/.test(req.url()))network.push(req.url());});
  for (const {id,file} of files) {
    await page.setViewportSize({width:1120,height:1000});
    await page.emulateMedia({media:'print',colorScheme:'light'});
    await page.goto(pathToFileURL(file).href,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    const geometry=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(sheet=>{
      const r=sheet.getBoundingClientRect();
      const footer=sheet.querySelector('.page-footer').getBoundingClientRect();
      const bottom=Math.max(...[...sheet.children].filter(c=>!c.classList.contains('page-footer')).map(c=>c.getBoundingClientRect().bottom));
      const overflow=[...sheet.querySelectorAll('.p,.period,.company,.name,.title,.chip,a')].filter(el=>{
        const p=el.getBoundingClientRect();return p.right>r.right-20 || p.left<r.left;
      }).map(el=>el.textContent.trim().slice(0,70));
      return {height:r.height,footerGap:footer.top-bottom,overflow};
    }));
    const scale = id === 'single-example' ? 0.99 : 1;
    await page.pdf({path:path.join(output,`${id}.pdf`),scale,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,timeout:20_000});
    let mobile;
    if(id!=='single-example') {
      await page.setViewportSize({width:390,height:500});
      await page.emulateMedia({media:'screen',colorScheme:'dark'});
      mobile=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,background:getComputedStyle(document.body).backgroundColor}));
    }
    const entry={id,scale,geometry,mobile};report.push(entry);
    console.log(JSON.stringify(entry));
  }
  // A realistic longer name/headline must wrap instead of escaping the page.
  await page.goto(pathToFileURL(files.find(f=>f.id==='template-mba-classic').file).href);
  await page.emulateMedia({media:'print',colorScheme:'light'});
  await page.setViewportSize({width:1120,height:1000});
  await page.evaluate(()=>{
    document.querySelector('.name').textContent='Alexandra Morgan-Smith';
    document.querySelector('.title').textContent='Senior Engineering Lead | Platform, Product & Delivery';
  });
  const longHeader=await page.evaluate(()=>{
    const sheet=document.querySelector('.sheet').getBoundingClientRect();
    return [...document.querySelectorAll('.name,.title,.role-block')].every(el=>el.getBoundingClientRect().right<=sheet.right-20);
  });
  if(!longHeader)throw new Error('Long name/headline overflow');
  if(network.length)throw new Error(`Export made network requests: ${network.join(', ')}`);
  fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));
  const failed=report.filter(r=>r.geometry.length!==2 || r.geometry.some(g=>g.height*r.scale>1124||g.footerGap<6||g.overflow.length) || (r.mobile&&r.mobile.scroll>r.mobile.width));
  if(failed.length)throw new Error(`Layout needs adjustment: ${failed.map(x=>x.id).join(', ')}`);
  console.log('PASS: ten offline exports, print geometry, footer clearance, and narrow dark-screen overflow');
} finally { await browser.close(); }
