(() => {
 'use strict';
 const config=__CONFIG__,layers=__LAYERS__,assets=__ASSETS__;
 const $=id=>document.getElementById(id);
 const stage=$('stage'),world=$('plane'),detail=$('detail'),markerRoot=$('markers'),nav=$('sectors');
 const labels=[],selectors=[],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=0,focused=false,visible=true;
 $('landscape').src=assets.landscape;
 $('mask-review').src=assets.maskLuma;
 $('water-light').style.maskImage=`url(${assets.mask})`;
 $('water-light').style.webkitMaskImage=`url(${assets.mask})`;
 const W=layers.nativeLandscape.width,H=layers.nativeLandscape.height;
 function place(el,left,top,width,height){Object.assign(el.style,{left:left/W*100+'%',top:top/H*100+'%',width:width/W*100+'%',height:height/H*100+'%'});world.append(el)}
 for(const t of layers.turbines){
  const tower=layers.tower,rotor=layers.rotor;
  const base=[t.base[0]*W,t.base[1]*H],scale=t.towerHeight*H/(tower.basePx[1]-tower.hubPx[1]),sx=scale*t.towerWidthScale;
  const fixed=document.createElement('img');fixed.className='tower';fixed.src=assets.tower;fixed.alt='';fixed.setAttribute('aria-hidden','true');
  place(fixed,base[0]-tower.basePx[0]*sx,base[1]-tower.basePx[1]*scale,tower.width*sx,tower.height*scale);
  const hub=[base[0]+(tower.hubPx[0]-tower.basePx[0])*sx,base[1]+(tower.hubPx[1]-tower.basePx[1])*scale];
  const rs=t.towerHeight*H*t.rotorRadiusRatio/rotor.bladeRadiusPx,projector=document.createElement('div'),blade=document.createElement('img');
  projector.className='rotor-projector';projector.style.transformOrigin=rotor.rotationOriginPercent.map(v=>v+'%').join(' ');projector.style.transform=`scaleX(${t.rotorWidthScale}) skewY(-6deg)`;
  blade.className='rotor';blade.src=assets.rotor;blade.alt='';blade.setAttribute('aria-hidden','true');blade.style.transformOrigin=projector.style.transformOrigin;blade.style.animationDuration=t.durationSeconds+'s';blade.style.animationDelay=-t.durationSeconds*t.phaseDegrees/360+'s';projector.append(blade);
  place(projector,hub[0]-rotor.hubPx[0]*rs,hub[1]-rotor.hubPx[1]*rs,rotor.width*rs,rotor.height*rs);
 }
 function render(){
  const w=stage.clientWidth,h=stage.clientHeight,fit=Math.max(w/W,h/H),iw=W*fit,ih=H*fit;
  const zoom=focused?(innerWidth<700?1.3:1.6):1;let tx=0,ty=0;
  if(focused){const uv=config.sectors[active].backgroundAnchor;const targetX=innerWidth<700?.5:.64,targetY=innerWidth<700?.62:.54;
   tx=Math.max(-(iw*zoom-w)/2,Math.min((iw*zoom-w)/2,w*(targetX-.5)-zoom*(uv[0]-.5)*iw));
   ty=Math.max(-(ih*zoom-h)/2,Math.min((ih*zoom-h)/2,h*(targetY-.5)-zoom*(uv[1]-.5)*ih));
  }
  Object.assign(world.style,{inset:'auto',width:iw+'px',height:ih+'px',left:(w-iw)/2+'px',top:(h-ih)/2+'px',transform:`translate(${tx}px,${ty}px) scale(${zoom})`});
  labels.forEach((b,i)=>{const uv=config.sectors[i].backgroundAnchor;b.style.left=(w/2+zoom*(uv[0]-.5)*iw+tx)+'px';b.style.top=(h/2+zoom*(uv[1]-.5)*ih+ty)+'px';b.hidden=focused&&i!==active});
 }
 function content(){const s=config.sectors[active];detail.querySelector('h2').textContent=s.title;detail.querySelector('.description').textContent=s.description;
  detail.querySelector('.applications').replaceChildren(...s.applications.map(t=>{const e=document.createElement('span');e.textContent=t;return e}));
  $('application-link').href=['biodiversite','aquaculture','agriculture','environnement'].includes(s.id)?'https://www.ldgenx.fr'+s.suggestedHref:'https://www.ldgenx.fr/applications';
  labels.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));selectors.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
 }
 function select(i){active=i;focused=true;content();render()}
 config.sectors.forEach((s,i)=>{
  const b=document.createElement('button');b.type='button';b.className='marker';b.textContent=s.title;b.setAttribute('aria-controls','detail');b.addEventListener('click',()=>select(i));markerRoot.append(b);labels.push(b);
  const n=document.createElement('button');n.type='button';n.setAttribute('aria-controls','detail');const number=document.createElement('span');number.className='number';number.textContent=String(i+1).padStart(2,'0');n.append(number,document.createTextNode(s.title));n.addEventListener('click',()=>select(i));nav.append(n);selectors.push(n);
 });
 $('overview').addEventListener('click',()=>{focused=false;render()});
 $('mask-toggle').addEventListener('click',()=>{const show=$('mask-review').hidden;$('mask-review').hidden=!show;$('mask-toggle').setAttribute('aria-pressed',String(show))});
 function pause(){world.classList.toggle('paused',!visible||document.hidden||reduced.matches)}
 new ResizeObserver(render).observe(stage);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pause()}).observe(stage);
 document.addEventListener('visibilitychange',pause);reduced.addEventListener('change',pause);content();render();pause();
})();
