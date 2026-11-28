// ═══════════════════════════════════════════════════════════════
// DEVELOPMENT / РАЗВИТИЕ — daily games for Lev & Mark (10–12 months)
// Content checked against CDC 2022 milestones, WHO 2019, AAP (Nov 2026).
// Not tied to clock time: "moments" of the day, per baby.
// Every step: its own picture + English + Russian.
// Data: table dev_entries (supabase-dev.sql); falls back to localStorage.
// ═══════════════════════════════════════════════════════════════
(function(){
const T_DEV = 'dev_entries';
const LS_KEY = 'dev_local_v1';
const KIDS = { lev:{en:'Lev', ru:'Лев', img:'lion.svg'}, mark:{en:'Mark', ru:'Марк', img:'tiger.svg'} };

// ── drawing kit ────────────────────────────────────────────────
const SK='#F6D7BE', S1='#DCCAB4', S2='#E9DCCB', BL='#E07A3F', INK='#1F2A37', SH='#8FB8C9', SH2='#A9CF8F', NAN='#C99A76', YEL='#F2C14E', GRN='#7FB77E';
const T = (x,y,t,o={}) => `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-size="${o.s||12}" font-weight="${o.w||700}" fill="${o.c||INK}" stroke="none" font-family="Inter,-apple-system,sans-serif">${t}</text>`;
const wrap = (inner, label, floor=true) => `<svg viewBox="0 0 310 150" class="dv-pic" role="img" aria-label="${label}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${floor?'<path d="M8 140h294"/>':''}${inner}</svg>`;
const sofa = (x=110,w=180) => `<rect x="${x}" y="45" width="${w}" height="45" rx="12" fill="${S1}"/><rect x="${x-5}" y="85" width="${w+10}" height="32" rx="10" fill="${S2}"/><path d="M${x+5} 117v23M${x+w-5} 117v23"/>`;
const chair = (x) => `<rect x="${x}" y="40" width="18" height="60" rx="5" fill="#C7B39B"/><rect x="${x-44}" y="85" width="62" height="14" rx="5" fill="${S2}"/><path d="M${x-40} 99v41M${x+14} 99v41"/>`;
const head = (x,y,r=13) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SK}"/><path d="M${x-r+2} ${y-6}c4-8 ${2*r-6}-8 ${2*r-4} 0"/><circle cx="${x-4}" cy="${y+1}" r="1.2" fill="${INK}" stroke="none"/><circle cx="${x+4}" cy="${y+1}" r="1.2" fill="${INK}" stroke="none"/><path d="M${x-3} ${y+6}q3 2 6 0"/>`;
const stand = (x,sh=SH,arms='') => `${head(x,66)}<rect x="${x-12}" y="79" width="24" height="34" rx="11" fill="${sh}"/><path d="M${x-6} 113v27M${x+6} 113v27" stroke-width="4"/>${arms}`;
const sit = (x,sh=SH,arms='') => `${head(x,84,12)}<rect x="${x-11}" y="96" width="22" height="26" rx="10" fill="${sh}"/><path d="M${x-6} 122c6 8 16 12 28 14M${x+5} 122c5 6 14 9 24 11" stroke-width="4"/>${arms}`;
const crawl = (x,sh=SH) => `<ellipse cx="${x}" cy="106" rx="24" ry="13" fill="${sh}"/>${head(x+30,94,12)}<path d="M${x+16} 115v25M${x-14} 115l-5 25M${x-22} 110l-16 8" stroke-width="4"/>`;
const nanny = (x,arms='') => `<circle cx="${x}" cy="72" r="14" fill="${NAN}"/><path d="M${x-12} 66c3-10 21-10 24 0" fill="#3B2F2A"/><path d="M${x-22} 140c0-24 9-44 22-44s22 20 22 44" fill="#D7C6E8"/>${arms}`;
const ball = (x,y,r=10) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${BL}"/><path d="M${x-r+2} ${y-3}c${(r*.6).toFixed(1)} 3 ${(r*1.2).toFixed(1)} 3 ${(r*1.6).toFixed(1)} 0"/>`;
const bubble = (x,y,t,w=104) => `<rect x="${x}" y="${y}" width="${w}" height="28" rx="12" fill="#fff"/>${T(x+w/2,y+19,t,{s:13})}`;
const mat = `<rect x="20" y="128" width="270" height="10" rx="5" fill="#CDE6DA" stroke="none"/>`;
const arrow = (x1,y1,x2,y2,c='#24613A') => { const a=Math.atan2(y2-y1,x2-x1), h=8; return `<path d="M${x1} ${y1}L${x2} ${y2}M${x2} ${y2}L${(x2-h*Math.cos(a-0.5)).toFixed(1)} ${(y2-h*Math.sin(a-0.5)).toFixed(1)}M${x2} ${y2}L${(x2-h*Math.cos(a+0.5)).toFixed(1)} ${(y2-h*Math.sin(a+0.5)).toFixed(1)}" stroke="${c}" stroke-width="2.5"/>`; };
const ok = (x,y) => `<circle cx="${x}" cy="${y}" r="11" fill="#2E8B57" stroke="none"/><path d="M${x-5} ${y}l3 4 7-8" stroke="#fff" stroke-width="2.5"/>`;
const no = (x,y) => `<circle cx="${x}" cy="${y}" r="11" fill="#C0392B" stroke="none"/><path d="M${x-4} ${y-4}l8 8M${x+4} ${y-4}l-8 8" stroke="#fff" stroke-width="2.5"/>`;
const hand = (x,y,flip=1) => `<path d="M${x} ${y}h${22*flip}a6 6 0 0 1 0 12h${-22*flip}z" fill="${NAN}"/><path d="M${x+18*flip} ${y}q${4*flip} -8 ${10*flip} -6" fill="${NAN}"/>`;
// high chair with baby, tray at y=88
const highchair = (x=150,sh=SH) => `<path d="M${x-30} 100l-10 40M${x+30} 100l10 40"/><rect x="${x-26}" y="40" width="52" height="60" rx="10" fill="#EFE7DD"/>${head(x,50,13)}<rect x="${x-12}" y="63" width="24" height="24" rx="9" fill="${sh}"/><rect x="${x-50}" y="86" width="100" height="10" rx="4" fill="#F5EFE6"/>`;
const piece = (x,y,c) => `<rect x="${x-4}" y="${y-4}" width="8" height="8" rx="2" fill="${c}"/>`;
const cupOpen = (x,y,s=1) => `<path d="M${x} ${y}h${16*s}l${-2*s} ${20*s}h${-12*s}z" fill="#9CC4E4"/><path d="M${x+2*s} ${y+5*s}h${12*s}" stroke="#4F8DB8"/>`;
const spoon = (x,y,ang=0) => `<g transform="rotate(${ang} ${x} ${y})"><path d="M${x} ${y}h28" stroke-width="3"/><ellipse cx="${x+34}" cy="${y}" rx="7" ry="5" fill="#E6E6E6"/><ellipse cx="${x+34}" cy="${y}" rx="4" ry="2.5" fill="${YEL}" stroke="none"/></g>`;
const bookOpen = (x,y,img='dog') => `<path d="M${x} ${y}c-14-8-34-8-48-3v40c14-5 34-5 48 3 14-8 34-8 48-3V${y-3}c-14-5-34-5-48 3z" fill="#fff"/><path d="M${x} ${y}v40"/>${img==='dog'?`<circle cx="${x+24}" cy="${y+16}" r="9" fill="#C99A76"/><path d="M${x+16} ${y+10}l-3-6 6 3M${x+32} ${y+10}l3-6-6 3"/><circle cx="${x+24}" cy="${y+18}" r="1.5" fill="${INK}" stroke="none"/>`:''}<circle cx="${x-24}" cy="${y+18}" r="8" fill="${YEL}"/>`;

// ── food art ───────────────────────────────────────────────────
const FOODS_OK = [['banana','#F6E7A1','Banana','Банан'],['avocado','#B9D48A','Avocado','Авокадо'],['pear','#E9E4A6','Ripe pear','Спелая груша'],['potato','#F2A65A','Cooked sweet potato','Варёный батат'],['toast','#E2B977','Soft toast','Мягкий тост'],['pasta','#F3DFA2','Soft pasta','Мягкие макароны']];
const FOODS_NO = [['grape','#7D4E9E','Whole grapes','Целый виноград'],['nut','#A0703C','Nuts','Орехи'],['carrot','#E8762C','Raw carrot / apple','Сырая морковь, яблоко'],['sausage','#C85C5C','Sausage rounds','Колбаса кружками']];
const foodIcon = (k,x,y,c) => {
  if (k==='banana') return `<circle cx="${x}" cy="${y}" r="12" fill="${c}"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#C9B45A"/>`;
  if (k==='toast') return `<rect x="${x-16}" y="${y-7}" width="32" height="14" rx="4" fill="${c}"/>`;
  if (k==='pasta') return `<path d="M${x-12} ${y}q6-10 12 0t12 0" stroke="#D4B460" stroke-width="5"/>`;
  if (k==='grape') return `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/>`;
  if (k==='nut') return `<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="${c}"/>`;
  if (k==='carrot') return `<path d="M${x-14} ${y-6}l28 6-28 6z" fill="${c}"/>`;
  if (k==='sausage') return `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/><circle cx="${x}" cy="${y}" r="5" fill="#E89B9B" stroke="none"/>`;
  return `<rect x="${x-10}" y="${y-10}" width="20" height="20" rx="4" fill="${c}"/>`;
};
const foodGrid = (list, mark) => wrap(list.map((f,i)=>{ const six = list.length>4; const x = six ? 50+(i%3)*100 : 80+(i%2)*150, y = six ? (i<3?40:100) : (i<2?32:104); return foodIcon(f[0],x,y,f[1])+T(x,y+26,f[2],{s:10,w:600})+T(x,y+38,f[3],{s:9,w:400,c:'#6B6358'})+(mark==='ok'?ok(x+20,y-14):no(x+20,y-14)); }).join(''), mark==='ok'?'Good soft finger foods':'Foods not allowed', false);

// ── pictures for steps ─────────────────────────────────────────
const P = {
  // movement
  floor1: () => wrap(mat+crawl(120)+T(250,40,'soft mat',{s:12,c:'#24613A'}), 'Baby on a soft play mat'),
  floor2: () => wrap(mat+crawl(90)+ball(230,128,10)+`<rect x="186" y="112" width="18" height="18" rx="3" fill="${YEL}"/>`+arrow(150,80,215,105), 'Toys a little out of reach'),
  floor3: () => wrap(mat+nanny(250)+crawl(100)+bubble(150,14,'Go get it!',100), 'Nanny sits on the floor and talks'),
  cruise1: () => wrap(sofa()+stand(110,SH,`<path d="M120 90l12-3M100 90l6-3"/>`), 'Baby stands at the sofa, hands on the seat'),
  cruise2: () => wrap(sofa()+stand(110,SH,`<path d="M120 90l12-3"/>`)+ball(265,74,11)+arrow(150,30,250,56), 'Toy at the other end of the sofa'),
  cruise3: () => wrap(sofa()+
    `<g class="dv-an" style="animation:dvball 7s ease-in-out infinite">${ball(265,74,11)}</g>`+
    `<g class="dv-an" style="animation:dvbw 7s ease-in-out infinite">
      <path class="dv-an" d="M104 113v27" stroke-width="4" style="transform-origin:104px 113px;animation:dvlgL 7s linear infinite"/>
      <path class="dv-an" d="M116 113v27" stroke-width="4" style="transform-origin:116px 113px;animation:dvlgR 7s linear infinite"/>
      ${head(110,66)}<rect x="98" y="79" width="24" height="34" rx="11" fill="${SH}"/><path d="M120 90l12-3M100 90l-2-3"/></g>`+
    nanny(42)+
    `<g class="dv-an" style="opacity:0;animation:dvb1 7s ease-in-out infinite">${bubble(8,14,'Come here!')}</g>`+
    `<g class="dv-an" style="opacity:0;animation:dvb2 7s ease-in-out infinite">${bubble(8,14,'Good job!')}<path d="M232 30l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${YEL}"/></g>`,
    'Cartoon: nanny calls, baby walks along the sofa to the ball'),
  cruiseH: () => wrap(sofa(40,130)+chair(250)+ball(235,74,10)+stand(160,SH,`<path d="M150 90l-8-3M170 90l36-3"/>`)+arrow(178,122,206,122)+T(192,135,'20–30 cm',{s:10,c:'#24613A'}), 'Sofa and chair with a small gap'),
  squat1: () => wrap(sofa()+stand(150,SH,`<path d="M160 90l12-3M140 90l6-3"/>`), 'Baby stands holding the sofa'),
  squat2: () => wrap(sofa()+stand(150,SH,`<path d="M160 90l12-3"/>`)+hand(200,118,-1)+ball(176,130,9), 'Put a toy by his feet'),
  squat3: () => wrap(sofa()+head(150,90,12)+`<rect x="139" y="102" width="22" height="20" rx="9" fill="${SH}"/><path d="M143 122l-8 18M157 122l8 18" stroke-width="4"/><path d="M158 110l16 16"/>`+ball(178,130,9)+arrow(205,120,205,70), 'Baby squats, takes the ball and stands up'),
  stand1: () => wrap(mat+sofa(150,130)+nanny(80)+stand(130,SH,`<path d="M140 90l12-3"/>`), 'Nanny kneels behind the baby'),
  stand2: () => wrap(mat+nanny(80)+stand(140,SH,`<path d="M128 92l-12 6M152 92l12 6"/><circle cx="114" cy="99" r="6" fill="${YEL}"/><circle cx="166" cy="99" r="6" fill="${BL}"/>`), 'A toy in each hand'),
  stand3: () => wrap(mat+nanny(80)+stand(140,SH,`<path d="M128 92l-12 6M152 92l12 6"/>`)+bubble(180,20,'1, 2, 3!',80), 'Count and clap'),
  hw1: () => wrap(nanny(70,`<path d="M88 104l52-10M88 110l52-8"/>`)+stand(150,SH), 'Hold both hands at shoulder height'),
  hw2: () => wrap(nanny(70,`<path d="M88 104l56-12"/>`)+stand(160,SH,`<path d="M170 92l6 6"/>`)+nanny(270)+bubble(195,14,'Come to me!',100), 'Walk to the other adult'),
  hw3: () => wrap(sit(150)+nanny(70)+bubble(180,30,'Rest',70), 'Stop when he sits down'),
  course1: () => wrap(mat+`<rect x="60" y="114" width="70" height="16" rx="8" fill="${S2}"/><rect x="150" y="118" width="60" height="12" rx="6" fill="#B9D4E8"/>`+T(95,108,'cushion',{s:11})+T(180,110,'blanket',{s:11}), 'Cushions lower than his knee'),
  course2: () => wrap(mat+`<path d="M110 132h100v-50h-100z" fill="#E8C9A0"/><path d="M122 132v-38h76v38" fill="#6B5847" stroke="none"/>`+T(160,70,'open box',{s:11}), 'A big box open at both ends'),
  course3: () => wrap(mat+`<rect x="40" y="114" width="60" height="16" rx="8" fill="${S2}"/><path d="M150 132h80v-40h-80z" fill="#E8C9A0"/><path d="M160 132v-30h60v30" fill="#6B5847" stroke="none"/>`+crawl(80)+ball(270,128,10), 'Baby crawls over and through to the toy'),
  push1: () => wrap(`<rect x="160" y="96" width="80" height="28" rx="6" fill="${YEL}"/><circle cx="174" cy="132" r="8" fill="#fff"/><circle cx="226" cy="132" r="8" fill="#fff"/><path d="M162 96l-14-34h-10"/><rect x="180" y="84" width="40" height="14" rx="2" fill="#9C6B3C"/>`+T(200,80,'books inside',{s:10}), 'Wide stable push cart with books inside'),
  push2: () => wrap(`<rect x="160" y="96" width="80" height="28" rx="6" fill="${YEL}"/><circle cx="174" cy="132" r="8" fill="#fff"/><circle cx="226" cy="132" r="8" fill="#fff"/><path d="M162 96l-14-34h-10"/>`+no(270,40)+T(270,66,'stairs',{s:10})+no(40,40)+T(40,66,'rug edge',{s:10}), 'Flat floor, away from stairs and rug edges'),
  push3: () => wrap(nanny(60)+`<rect x="180" y="96" width="70" height="26" rx="6" fill="${YEL}"/><circle cx="192" cy="132" r="8" fill="#fff"/><circle cx="238" cy="132" r="8" fill="#fff"/><path d="M182 96l-14-34h-10"/>`+stand(140,SH,`<path d="M150 88l10-24"/>`), 'Nanny kneels next to him'),

  // eating
  fin1: () => wrap(highchair()+piece(124,90,'#F6E7A1')+piece(140,90,'#B9D48A')+piece(156,90,'#F2A65A')+bubble(188,20,'3 pieces first',112)+T(70,40,'then puree',{s:12,c:'#6B5B4B'}), 'Two or three soft pieces on the tray first', false),
  fin2: () => foodGrid(FOODS_OK,'ok'),
  fin3: () => wrap(`<circle cx="70" cy="70" r="7" fill="#7FB77E"/>`+T(70,98,'pea',{s:11})+T(70,112,'= size',{s:11,w:500})+`<rect x="140" y="50" width="90" height="34" rx="16" fill="${NAN}"/><rect x="150" y="84" width="80" height="22" rx="10" fill="${NAN}"/><rect x="176" y="66" width="12" height="12" rx="2" fill="#F6E7A1"/>`+T(200,128,'squash it easily = OK',{s:11}), 'Pea size, soft enough to squash between finger and thumb', false),
  fin4: () => wrap(highchair()+`<path d="M136 74l-14 12" stroke-width="3"/>`+piece(120,88,'#F6E7A1')+nanny(270)+bubble(190,14,'Take it!',80), 'He picks pieces up with his fingers, nanny stays next to him', false),
  finNo: () => foodGrid(FOODS_NO,'no'),
  cup1: () => wrap(cupOpen(130,40,2.4)+T(150,120,'small OPEN cup',{s:12})+ok(200,40)+`<path d="M230 60h20l-2 30h-16z" fill="#E7A9C4"/><path d="M234 60l4-14"/>`+no(262,46)+T(250,120,'no sippy',{s:10}), 'A small open cup, not a sippy cup', false),
  cup2: () => wrap(highchair()+`<g transform="rotate(-30 168 60)">${cupOpen(160,52,1.2)}</g>`+hand(186,72,-1)+bubble(200,14,'Sip, sip!',80), 'You hold the cup to his lips, he sips', false),
  spoon1: () => wrap(highchair()+`<path d="M70 120h50v-14h-50z" fill="#fff"/>`+`<ellipse cx="95" cy="106" rx="22" ry="5" fill="${YEL}"/>`+spoon(60,70,-10)+T(90,40,'1. fill the spoon',{s:11}), 'You fill the spoon', false),
  spoon2: () => wrap(highchair()+spoon(160,72,-60)+T(240,40,'2. spoon in',{s:11})+T(240,54,'his hand',{s:11})+bubble(200,96,'Mess is OK',90), 'Put the spoon in his hand, he brings it to his mouth', false),

  // sitting play
  book1: () => wrap(nanny(100)+sit(150)+bookOpen(200,92), 'Baby on your lap with a board book'),
  book2: () => wrap(bookOpen(150,50)+`<path d="M196 112l-18-38" stroke-width="5" stroke="${NAN}"/>`+bubble(30,14,'Dog! Woof-woof!',120), 'Point at the picture and name it', false),
  book3: () => wrap(bookOpen(150,50)+`<path d="M110 120l14-48" stroke-width="5" stroke="${SK}"/>`+bubble(182,14,'Where is the cat?',120)+T(240,130,'wait 5 seconds',{s:11,c:'#6B5B4B'}), 'Ask and wait for him to point', false),
  box1: () => wrap(`<rect x="90" y="80" width="130" height="58" rx="4" fill="${S2}"/><ellipse cx="155" cy="80" rx="22" ry="7" fill="${INK}"/>`+T(155,72,'round hole',{s:11}).replace('y="72"','y="64"'), 'Shoe box with a round hole'),
  box2: () => wrap(ball(70,70,16)+ok(96,50)+`<rect x="140" y="56" width="40" height="30" rx="4" fill="#E6E6E6"/>`+ok(190,50)+T(160,104,'big lid',{s:10})+`<circle cx="250" cy="72" r="6" fill="#4F8DB8"/>`+no(270,56)+T(250,104,'bottle cap',{s:10})+T(70,104,'ball 5 cm+',{s:10}), 'Only big things: balls 5 cm or more, big lids. No bottle caps', false),
  box3: () => wrap(sit(80,SH,`<path d="M92 104l40-20"/>`)+`<rect x="150" y="96" width="90" height="42" rx="4" fill="${S2}"/><ellipse cx="195" cy="96" rx="16" ry="5" fill="${INK}"/>`+ball(195,64,11)+arrow(195,78,195,90)+bubble(200,14,'In it goes!',96), 'He drops it in, you open the box'),
  hide1: () => wrap(sit(80)+ball(200,128,10)+`<path d="M160 70c20-20 60-20 80 0" fill="#E7A9C4"/>`+arrow(200,80,200,108), 'While he watches, cover the toy with a cloth'),
  hide2: () => wrap(sit(80)+`<path d="M170 138c4-30 50-34 70-10l6 10z" fill="#E7A9C4"/>`+bubble(150,14,'Where is the ball?',130), 'Ask: where is the ball?'),
  hide3: () => wrap(sit(80,SH,`<path d="M92 104l60 10"/>`)+`<path d="M150 116c10-10 30-12 40-4" fill="#E7A9C4"/>`+ball(210,128,10)+bubble(190,14,'Here it is!',100), 'He pulls the cloth off'),
  bucket1: () => wrap(sit(80)+`<path d="M160 98h60l-6 40h-48z" fill="#9CC4E4"/><rect x="232" y="122" width="16" height="16" rx="3" fill="${YEL}"/><rect x="250" y="122" width="16" height="16" rx="3" fill="${BL}"/>`+arrow(240,110,215,96)+bubble(160,14,'In!',50)+bubble(220,14,'Out!',56), 'Blocks into the bucket and out'),
  bucket2: () => wrap(`<rect x="110" y="90" width="90" height="48" rx="6" fill="#E7A9C4"/><path d="M140 90c4-30 30-30 30 0" fill="#9CC4E4"/>`+T(155,60,'separate scarves',{s:11})+T(250,90,'shorter than',{s:10})+T(250,104,'your forearm',{s:10}), 'Separate scarves out of a tissue box'),
  bucket3: () => wrap(`<path d="M60 110q40-30 80 0t80 0" stroke="#E7A9C4" stroke-width="8"/>`+no(240,60)+T(150,136,'never tie them together',{s:11}), 'Never tie scarves together'),
  cups1: () => wrap(`<path d="M80 138l6-30h40l6 30z" fill="${BL}"/><path d="M92 108l4-22h24l4 22z" fill="${YEL}"/>`+arrow(150,100,190,100)+`<path d="M210 138l6-40h44l6 40z" fill="${GRN}"/>`+T(150,40,'small cup inside big cup',{s:12}), 'Show: small cup goes inside a big cup'),
  cups2: () => wrap(`<path d="M120 138h70"/><path d="M155 138v-90" stroke-width="4"/><ellipse cx="155" cy="128" rx="30" ry="8" fill="${BL}"/><ellipse cx="155" cy="114" rx="24" ry="7" fill="${YEL}"/><ellipse cx="200" cy="80" rx="18" ry="6" fill="${GRN}"/>`+arrow(180,90,200,86)+T(240,40,'rings off',{s:12}), 'He takes the rings off'),
  bang1: () => wrap(`<rect x="100" y="100" width="34" height="34" rx="4" fill="${YEL}"/><rect x="170" y="100" width="34" height="34" rx="4" fill="${BL}"/><path d="M146 100l4-14M156 102l10-10M140 104l-4-14" stroke="#B45309"/>`+bubble(110,20,'Bang, bang!',100), 'Bang block against block'),
  bang2: () => wrap(nanny(80,`<path d="M100 104l20-8"/>`)+sit(210,SH,`<path d="M220 104l10-8"/>`)+bubble(120,20,'Your turn!',90), 'He copies you'),
  towel1: () => wrap(`<path d="M80 134h150l10 6H74z" fill="#9CC4E4"/>`+ball(215,124,10)+T(150,40,'toy on a towel, far away',{s:12}), 'Toy on a towel out of reach'),
  towel2: () => wrap(sit(60,SH,`<path d="M72 106l30 24"/>`)+`<path d="M100 134h130l10 6H94z" fill="#9CC4E4"/>`+ball(215,124,10)+arrow(200,110,140,110)+bubble(150,14,'Pull! Pull!',90), 'He pulls the towel to get the toy'),
  button1: () => wrap(`<rect x="100" y="80" width="110" height="52" rx="10" fill="${YEL}"/><circle cx="130" cy="106" r="10" fill="${BL}"/><circle cx="160" cy="106" r="10" fill="${GRN}"/><circle cx="190" cy="106" r="10" fill="#4F8DB8"/>`+T(155,60,'toy with buttons',{s:12}), 'Toy with buttons'),
  button2: () => wrap(sit(70,SH,`<path d="M82 104l40 0"/>`)+`<rect x="120" y="96" width="90" height="40" rx="8" fill="${YEL}"/><circle cx="140" cy="116" r="8" fill="${BL}"/><path d="M226 100c8 6 8 16 0 22M236 94c12 10 12 24 0 34"/>`+bubble(180,14,'Listen! Music!',110), 'He presses — music!'),
  mirror1: () => wrap(`<rect x="170" y="20" width="90" height="118" rx="10" fill="#E8F1F8"/>`+sit(110)+head(216,90,12)+bubble(20,14,'Who is this? Lev!',130), 'Unbreakable mirror on the wall'),
  mirror2: () => wrap(`<rect x="170" y="20" width="90" height="118" rx="10" fill="#E8F1F8"/>`+sit(110,SH,`<path d="M118 92l-8-6"/>`)+head(216,90,12)+bubble(20,14,'Where is your nose?',140), 'Point at nose, eyes, ears'),

  // together
  roll1: () => wrap(mat+sit(60,SH)+sit(240,SH2)+nanny(150), 'Both babies face each other, you in the middle'),
  roll2: () => wrap(mat+sit(60,SH)+sit(240,SH2)+ball(160,128,10)+arrow(130,118,90,118)+bubble(100,14,'Lev, catch!',90), 'Roll the ball to one baby'),
  roll3: () => wrap(mat+sit(60,SH)+sit(240,SH2)+ball(160,128,10)+arrow(190,118,226,118)+bubble(150,14,'Roll it to Mark!',120), 'Help him roll it to his brother'),
  peek1: () => wrap(nanny(150,`<rect x="134" y="62" width="32" height="18" rx="6" fill="${NAN}"/>`)+bubble(182,20,'Where is Nanny?',120), 'Hide your face behind your hands'),
  peek2: () => wrap(nanny(150,`<path d="M128 92l-14-24M172 92l14-24"/>`)+bubble(190,20,'Peekaboo!',90)+sit(60)+sit(260,SH2), 'Peekaboo!'),
  peek3: () => wrap(sit(150,SH,`<rect x="136" y="72" width="28" height="14" rx="6" fill="#E7A9C4"/>`)+bubble(190,20,'Where is Lev?',110), 'Now the baby hides'),
  song1: () => wrap(`<path d="M120 30v40a8 8 0 1 1-6-8V30h20"/><path d="M190 40v40a8 8 0 1 1-6-8V40h20"/>`+T(155,110,'Pat-a-cake · This little piggy',{s:11})+T(155,126,'Itsy-bitsy spider · Wheels on the bus',{s:11}), 'Same songs every day'),
  song2: () => wrap(nanny(90,`<path d="M70 100l14-8M110 100l-14-8"/>`)+sit(210)+bubble(130,14,'Clap, clap!',90), 'Show the hand moves slowly'),
  song3: () => wrap(sit(100,SH,`<path d="M90 104l8-8M110 104l-8-8"/>`)+sit(210,SH2,`<path d="M200 104l8-8M220 104l-8-8"/>`)+`<path d="M155 40l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${YEL}"/>`, 'They clap by themselves'),
  copy1: () => wrap(nanny(90,`<path d="M70 100h10M100 100h10"/>`)+sit(210)+bubble(130,14,'Do like me!',90), 'You clap, wave, shake your head'),
  copy2: () => wrap(nanny(90)+sit(210,SH,`<path d="M220 100l10-12"/>`)+bubble(130,14,'Bye-bye!',80), 'He copies — praise him'),
  give1: () => wrap(nanny(80,`<path d="M100 104l40 0"/>`)+`<rect x="140" y="94" width="18" height="18" rx="4" fill="${YEL}"/>`+sit(220)+bubble(110,14,'Here you are.',110), 'Pass a toy: here you are'),
  give2: () => wrap(nanny(80,`<path d="M100 104l40 0"/>`)+sit(220,SH,`<path d="M210 104l-30 0"/>`)+`<rect x="168" y="94" width="18" height="18" rx="4" fill="${YEL}"/>`+bubble(110,14,'Give me, please.',120), 'Hold out your hand: give me'),
  give3: () => wrap(sit(70)+sit(240,SH2)+`<path d="M110 110h40M200 110h-30"/><rect x="146" y="98" width="18" height="18" rx="4" fill="${YEL}"/>`+bubble(110,14,'Thank you!',90), 'Thank you — now to the other baby'),
  theme: () => wrap(`<path d="M30 110h70l-6 26H36z" fill="#9CC4E4"/><rect x="120" y="100" width="50" height="36" rx="6" fill="#E7A9C4"/><path d="M190 136h50l-4-22h-42z" fill="#C7CDD4"/><path d="M222 108l14-30" stroke-width="4"/>`+ball(270,126,12), 'Water, textures, music and balls'),

  // walk / bath / sleep
  walk1: () => wrap(`<path d="M60 70h70a32 32 0 0 1-32 36H84A26 26 0 0 1 60 80z" fill="${SH}"/><path d="M60 70a34 34 0 0 1 34-34v34"/><path d="M130 70l12-18h10"/><circle cx="74" cy="128" r="12"/><circle cx="118" cy="128" r="12"/><circle cx="230" cy="70" r="26" fill="${SH2}"/><path d="M230 96v44"/>`+bubble(170,10,'Look, a tree!',110), 'Name what you see'),
  walk2: () => wrap(nanny(90,`<path d="M110 100l30-10"/>`)+head(150,84,11)+`<path d="M200 140v-60" stroke-width="3"/><path d="M200 80q20-20 40 0" fill="${SH2}"/>`+bubble(170,14,'Touch the leaf',110), 'Stop, let him look and touch'),
  walk3: () => wrap(`<circle cx="155" cy="70" r="40" fill="#fff"/><path d="M155 70V44M155 70l18 10"/>`+T(155,136,'max 1 hour in the pram',{s:12}), 'Not more than 1 hour in the pram'),
  bath1: () => wrap(`<path d="M60 80h190l-14 50H74z" fill="#fff"/><path d="M70 92c20-6 30 6 50 0s30 6 50 0 30 6 60 0" stroke="#1F5A85"/>`+head(140,66,12)+`<path d="M200 40l-46 30" stroke-width="6" stroke="${NAN}"/>`+bubble(200,10,'Hand on baby',100), 'One hand on the baby all the time', false),
  bath2: () => wrap(`<circle cx="100" cy="70" r="36" fill="#fff"/>`+T(100,76,'5–10 min',{s:13})+`<path d="M200 50c10 14 14 24 14 32a14 14 0 0 1-28 0c0-8 4-18 14-32z" fill="#F6C9A8"/>`+T(200,128,'warm, not hot',{s:12}), 'Warm, 5–10 minutes', false),
  bath3: () => wrap(`<rect x="120" y="50" width="40" height="70" rx="8" fill="#F5EFE6"/>`+T(140,90,'cream',{s:11})+head(220,80,14)+arrow(170,86,200,86)+T(155,138,'pat dry → cream straight away',{s:11}), 'Pat dry and put the cream on', false),
  calm1: () => wrap(`<circle cx="100" cy="70" r="36" fill="#fff"/>`+T(100,76,'30 min',{s:14})+no(240,50)+ball(220,110,12)+T(230,138,'no active games',{s:11}), 'No active games 30 minutes before sleep'),
  calm2: () => wrap(nanny(110)+`<ellipse cx="150" cy="104" rx="30" ry="12" fill="${SH}"/>`+head(124,96,11)+`<path d="M230 40a16 16 0 1 0 16 18 13 13 0 0 1-16-18z" fill="${YEL}"/>`, 'Dim light, cuddle, slow voice'),
  bed1: () => wrap(`<rect x="110" y="50" width="20" height="60" rx="4" fill="#9CC4E4"/><path d="M114 50v-10h12v10"/><path d="M180 60h40" stroke-width="5"/><rect x="216" y="54" width="20" height="12" rx="3" fill="#fff"/>`+T(120,130,'bottle',{s:11})+T(210,130,'brush teeth',{s:11}), 'Bottle, then brush teeth'),
  bed2: () => wrap(nanny(100)+sit(150)+bookOpen(200,92), 'The same book every night'),
  bed3: () => wrap(`<rect x="60" y="70" width="160" height="56" rx="8" fill="#ECEAF6"/><path d="M60 126v14M220 126v14"/>`+head(96,90,11)+`<path d="M260 40a18 18 0 1 0 18 20 15 15 0 0 1-18-20z" fill="${YEL}"/>`+no(170,40)+T(170,24,'no bottle in cot',{s:10}), 'Awake but sleepy in the cot, no bottle'),
};

const thumb = id => (P[id] ? P[id]() : '').replace(/class="dv-an"[^>]*style="[^"]*"/g,'');

// ── videos (checked 28.11.2026) ───────────────────────────────
const V = (id,t,src,len) => ({u:'https://www.youtube.com/watch?v='+id, t, src, len});
const VID = {
  floor:[V('YEIfA-iUoxk','Pulling up to Stand','Pediatric physical therapist','2.5 min')],
  cruise:[V('GZO8fYjrVak','Furniture Follow','Pathways.org','20 sec'),V('9ljaqzG9h_E','Furniture Surf (harder)','Pathways.org','short')],
  squat:[V('eNxkt9ysWQc','Crouch to Stand','Pathways.org','21 sec'),V('THzRNGtONMs','Squatting to Standing','Pediatric physical therapist','1.5 min')],
  course:[V('nWS12C_IhQ8','Obstacle Cruise','Pathways.org','short')],
  finger:[V('aTz0eXDua3o','Tray Pick Up (finger food)','Pathways.org','short'),V('pymSN_42DU0','The Pincer Grasp','Pathways.org','57 sec'),V('5q3azhKq0dQ','Picks up food with 2 fingers','CDC','short')],
  book:[V('cbLRThZkLxE','The Daily Read','Pathways.org','21 sec'),V('4BLS46cM8HY','Reading Aloud with a 6–12 Month Old','Reach Out and Read, pediatrician','2.5 min')],
  box:[V('Bu2W89FzKiw','Puts something in a container','CDC','short')],
  bucket:[V('Bu2W89FzKiw','Puts something in a container','CDC','short')],
  hide:[V('iIn-HkVdufU','Hide and Find','Pathways.org','14 sec'),V('xhvRI5J8R1g','Hide and Seek for Babies','Pathways.org','30 sec')],
  mirror:[V('PH1QDSJmcq0','Monkey See, Monkey Do (mirror)','Pathways.org','short')],
  ballroll:[V('_I0pYPPBcWY','Roll to Me','Pathways.org','20 sec')],
  peek:[V('H8v-SJhfWRM','Play Peek-A-Boo','Pathways.org','short')],
  songs:[V('nCZAtzwmEls','Pat A Cake','Pathways.org','18 sec')],
  copy:[V('QbbwOl7s5io','Copy Cat Chit Chat','Pathways.org','short')],
  give:[V('sfKO5t1BO3k','Serve and Return','Pathways.org','1 min')],
  theme:[V('r-rGynVnISc','Splish Splash (water)','Pathways.org','13 sec'),V('VmuWIcPagT8','Textures and Temps','Pathways.org','short')],
  walk:[V('MrYATxV6MJI','Enjoy the Outdoors','Pathways.org','28 sec'),V('4oR-zPNkW3g','Talk when you are out and about','National Literacy Trust','1 min')],
  bath:[V('5p7TzabykbE','Bath Time Fun','National Literacy Trust','1.5 min')],
  bedbook:[V('984TN1og8qI','Best baby bedtime routine','Tresillian (child health)','44 sec'),V('FUlNJ_zsfHQ','Reading at Bedtime','Reach Out and Read, pediatrician','39 sec')],
};

// ── Russian words for the family ────────────────────────────────
const RW = {
  good:['Молодец!','ma-la-DYETS','Good job!'], come:['Иди ко мне!','ee-DEE ka MNYEH','Come to me!'],
  where:['Где?','GDYEH','Where?'], give:['Дай','DAI','Give me'], here:['На','NA','Here you are'],
  mama:['Мама / Папа','MA-ma / PA-pa','Mama / Papa'], night:['Спокойной ночи','spa-KOY-noy NO-chee','Good night'],
};

// ── exercises: steps = [picture, English, Russian] ─────────────
const EX = {
  floor:{t:'Free floor play', ru:'Свободная игра на полу', min:'5–10 min',
    steps:[['floor1','Put him on the soft play mat.','Положите малыша на мягкий коврик.'],
           ['floor2','Put 2–3 toys a little out of his reach.','Положите 2–3 игрушки чуть дальше, чем он может дотянуться.'],
           ['floor3','Sit on the floor and talk. Let him crawl, turn and pull up by himself.','Сядьте рядом на пол и разговаривайте. Пусть сам ползёт, поворачивается, встаёт.']],
    say:[['Where is the ball? Go get it!','Где мячик? Достань!'],['You are crawling! Good job!','Ты ползёшь! Молодец!']], rw:['good','where'],
    safe:['Never pull him up by the hands. To lift — hold under the arms.','Не тянуть за руки. Поднимать только под мышки.']},
  cruise:{t:'Walking along the sofa', ru:'Ходьба вдоль дивана', min:'3–7 min',
    steps:[['cruise1','Stand him at one end of the sofa, hands on the seat.','Поставьте малыша у края дивана, руки на сиденье.'],
           ['cruise2','Put a favourite toy at the other end.','На другой конец положите любимую игрушку.'],
           ['cruise3','Call his name and wait. He walks with side steps. Clap for every step!','Позовите по имени и ждите. Он идёт боком к игрушке. Хвалите каждый шаг!']],
    harder:['cruiseH','Easy now? Put a heavy chair next to the sofa with a 20–30 cm gap. He steps from sofa to chair.','Получается? Поставьте тяжёлый стул рядом с диваном с зазором 20–30 см — пусть перешагнёт.'],
    say:[['Lev, come here! Come to me!','Лёва, иди ко мне!'],['One step… two steps!','Один шаг… два!'],['You did it! Good job!','Получилось! Молодец!']], rw:['come','good'],
    safe:['Soft mat. Sharp corners covered. Keep the other baby in sight.','Мягкий коврик, углы закрыты, второй малыш на виду.']},
  squat:{t:'Squat and stand', ru:'Присесть и встать', min:'3–5 min', later:true,
    steps:[['squat1','He stands holding the sofa.','Малыш стоит, держась за диван.'],
           ['squat2','Put a toy on the floor by his feet.','Положите игрушку на пол у его ног.'],
           ['squat3','Say “Pick up the ball!” He squats, takes it and stands up.','Скажите «Подними мячик!» — он приседает, берёт и встаёт.']],
    note:['Many babies learn this at 12–15 months. Just try — no pressure.','Многие дети учатся этому в 12–15 месяцев. Просто пробуйте, без давления.'],
    say:[['Pick up the ball!','Подними мячик!'],['Up you go!','Встаём!'],['Good job!','Молодец!']], rw:['good']},
  stand:{t:'Standing alone', ru:'Стоять без опоры', min:'2–3 min', later:true,
    steps:[['stand1','Kneel behind him while he stands at the sofa.','Встаньте на колени позади малыша, пока он стоит у дивана.'],
           ['stand2','Give him a toy in each hand, so he lets go.','Дайте по игрушке в каждую руку — он отпустит опору.'],
           ['stand3','Count “one, two, three!” and clap.','Считайте «раз, два, три!» и хлопайте.']],
    note:['Standing alone comes between 7 and 17 months. All normal.','Стоять сам ребёнок начинает от 7 до 17 месяцев — всё это норма.'],
    say:[['Look, no hands!','Смотри, без рук!'],['One, two, three!','Раз, два, три!']], rw:['good'],
    safe:['Only on the soft mat. No hard edges within reach.','Только на мягком коврике, без твёрдых углов рядом.']},
  handwalk:{t:'Steps holding hands', ru:'Шаги за руку', min:'3–5 min', one:true,
    steps:[['hw1','Hold both his hands at his shoulder height or lower.','Держите обе руки малыша не выше уровня его плеч.'],
           ['hw2','Walk slowly to the other adult, who calls him. Later hold only one hand.','Медленно идите к другому взрослому, который зовёт. Потом — за одну руку.'],
           ['hw3','Stop when he sits down or is tired.','Остановитесь, когда он садится или устал.']],
    say:[['Step, step, step!','Шаг, шаг, шаг!'],['Walk to Mama!','Иди к маме!']], rw:['come','mama'],
    safe:['If he falls — let go of the hand and catch his body. Never pull the arm up.','Если падает — отпустить руку и подхватить за туловище. Не тянуть руку вверх.']},
  course:{t:'Crawl course', ru:'Полоса препятствий', min:'5 min', one:true,
    steps:[['course1','On the mat: cushions and a rolled blanket, lower than his knee.','На коврике: подушки и свёрнутое одеяло ниже его колена.'],
           ['course2','Tunnel: a big cardboard box open at both ends.','Тоннель: большая коробка, открытая с двух сторон.'],
           ['course3','Put a toy at the end. He crawls over and through.','В конце — игрушка. Он ползёт через подушки и коробку.']],
    say:[['Over the pillow!','Через подушку!'],['Where is Lev? Here he is!','Где Лёва? Вот он!']], rw:['where','good'],
    safe:['No tunnels made of chairs. Never on the staircase. Stair gates closed.','Никаких тоннелей из стульев, не на лестнице, ворота на лестнице закрыты.']},
  push:{t:'Push toy', ru:'Каталка-толкатель', min:'3–5 min', one:true,
    steps:[['push1','Only a wide, stable push cart. Put books inside to make it heavy.','Только широкая устойчивая каталка. Положите внутрь книги для веса.'],
           ['push2','Flat floor. Away from stairs, doors and rug edges.','Ровный пол, подальше от лестницы, дверей и края ковра.'],
           ['push3','Kneel next to him while he pushes.','Будьте рядом на коленях, пока он толкает.']],
    say:[['Push, push!','Толкай, толкай!'],['Where are you going?','Куда едешь?']], rw:['good'],
    safe:['No sit-in baby walkers and no jumpers.','Никаких ходунков и прыгунков.']},

  finger:{t:'Pieces with fingers', ru:'Кусочки руками', min:'every meal',
    steps:[['fin1','At every meal: before the puree, put 2–3 soft pieces on the tray.','В каждую еду: до пюре положите на столик 2–3 мягких кусочка.'],
           ['fin2','Good foods: banana, avocado, ripe pear, cooked sweet potato, soft toast, soft pasta.','Можно: банан, авокадо, спелая груша, варёный батат, мягкий тост, мягкие макароны.'],
           ['fin3','Size of a pea. So soft you can squash it between your finger and thumb.','Размер — с горошину. Такие мягкие, что легко раздавить двумя пальцами.'],
           ['fin4','Let him pick them up with his fingers. Stay next to him the whole meal.','Пусть берёт пальчиками сам. Вы рядом всю еду.'],
           ['finNo','Never: whole grapes, nuts, raw carrot or apple, sausage rounds.','Нельзя: целый виноград, орехи, сырая морковь и яблоко, колбаса кружками.']],
    plan:[['Week 1–2: puree a little thicker, with small soft lumps','Недели 1–2: пюре погуще, с мягкими комочками'],['Week 3–4: mashed food with soft pieces','Недели 3–4: размятая еда с мягкими кусочками'],['Week 5–6: most of the meal soft chopped pieces','Недели 5–6: почти вся еда мягкими кусочками']],
    note:['Only foods the parents already gave. Coughing a little is normal — this is how he learns.','Только продукты, которые родители уже давали. Немного покашливать — нормально, так он учится.'],
    say:[['Banana! Soft banana.','Банан! Мягкий банан.'],['Take it with your fingers.','Возьми пальчиками.'],['Yummy! Good job!','Вкусно! Молодец!']], rw:['good']},
  cupspoon:{t:'Open cup and spoon', ru:'Открытая чашка и ложка', min:'every meal',
    steps:[['cup1','Use a small open cup — not a sippy cup. A little water.','Маленькая открытая чашка, не поильник. Немного воды.'],
           ['cup2','You hold the cup at his lips and tip it slowly. He sips.','Вы держите чашку у губ и медленно наклоняете. Он отпивает.'],
           ['spoon1','Fill the spoon with puree.','Наберите пюре в ложку.'],
           ['spoon2','Put the spoon in his hand. He brings it to his mouth. Mess is OK!','Дайте ложку ему в руку — он сам несёт в рот. Испачкается — нормально!']],
    say:[['Sip, sip!','Глоточек!'],['Here is your spoon.','Вот твоя ложка.'],['You did it!','Получилось!']], rw:['here','good'],
    safe:['No juice.','Без сока.']},

  book:{t:'Picture book', ru:'Книжка с картинками', min:'5–10 min', must:true,
    steps:[['book1','Sit him on your lap. A thick board book, one big picture on a page.','Посадите малыша на колени. Картонная книжка, одна большая картинка на странице.'],
           ['book2','Point at the picture and name it: “Dog! Woof-woof!”','Покажите пальцем и назовите: «Собака! Гав-гав!»'],
           ['book3','Ask “Where is the cat?” — wait 5 seconds for him to look or touch.','Спросите «Где кошка?» и ждите 5 секунд, пока он посмотрит или покажет.']],
    say:[['Look! A dog! Woof-woof!','Смотри! Собака! Гав-гав!'],['Where is the cat? Here it is!','Где кошка? Вот она!'],['Your turn — turn the page!','Теперь ты — переверни страницу!']], rw:['where','good']},
  box:{t:'Box with a hole', ru:'Коробка с отверстием', min:'5 min',
    steps:[['box1','Make a round hole in the lid of a shoe box.','Сделайте круглое отверстие в крышке обувной коробки.'],
           ['box2','Use only big things: soft balls 5 cm or more, big lids from formula tins. No bottle caps.','Только крупное: мячики от 5 см, большие крышки от банок смеси. Без бутылочных крышек.'],
           ['box3','He drops them in. Open the box: “Where is it? Here!”','Он бросает внутрь. Откройте коробку: «Где? Вот!»']],
    say:[['In it goes!','Бросай!'],['Where is the ball? Here it is!','Где мячик? Вот он!']], rw:['where','good']},
  hide:{t:'Hide the toy', ru:'Спрятанная игрушка', min:'3–5 min',
    steps:[['hide1','While he watches, cover a toy with a cloth.','У него на глазах накройте игрушку платком.'],
           ['hide2','Ask “Where is the ball?”','Спросите «Где мячик?»'],
           ['hide3','He pulls the cloth off. Celebrate!','Он стягивает платок. Радуйтесь вместе!']],
    say:[['Where is the ball?','Где мячик?'],['Here it is!','Вот он!']], rw:['where','good']},
  bucket:{t:'In and out', ru:'Положить и достать', min:'5 min',
    steps:[['bucket1','Big blocks into a bucket — then out again.','Крупные кубики в ведёрко — и обратно.'],
           ['bucket2','Pull separate scarves out of a tissue box. Each scarf shorter than your forearm.','Доставать отдельные платочки из коробки. Каждый короче вашего предплечья.'],
           ['bucket3','Never tie or sew scarves together. Put them away after.','Не связывать и не сшивать платки. Убрать после игры.']],
    say:[['In!','Положи!'],['Out!','Достань!'],['Give me the block — thank you!','Дай кубик — спасибо!']], rw:['give','here']},
  cups:{t:'Cups and rings', ru:'Стаканчики и пирамидка', min:'5 min',
    steps:[['cups1','Show how a small cup goes inside a big cup.','Покажите, как маленький стаканчик входит в большой.'],
           ['cups2','Let him take the rings off the ring tower.','Пусть снимает кольца с пирамидки.']],
    note:['Putting rings on and towers of 2 usually come at 12–15 months.','Надевать кольца и строить башню из двух — обычно в 12–15 месяцев.'],
    say:[['Big cup, small cup.','Большой, маленький.'],['Off it comes!','Сняли!']], rw:['good']},
  bang:{t:'Bang and clap', ru:'Стучать и хлопать', min:'3 min',
    steps:[['bang1','Bang block against block, or a wooden spoon on a pot.','Стучите кубиком о кубик или деревянной ложкой по кастрюле.'],
           ['bang2','He copies you. Then clap hands together.','Он повторяет. Потом хлопайте в ладоши вместе.']],
    say:[['Bang, bang!','Бах, бах!'],['Your turn!','Теперь ты!']], rw:['good']},
  towel:{t:'Pull the towel', ru:'Потяни полотенце', min:'3 min',
    steps:[['towel1','Put a toy on a small towel, far from him. The towel edge is near his hands.','Положите игрушку на полотенце подальше, край полотенца — у его рук.'],
           ['towel2','He pulls the towel to get the toy.','Он тянет полотенце и достаёт игрушку.']],
    say:[['Pull! Pull!','Тяни, тяни!'],['You got it!','Достал!']], rw:['good'],
    safe:['No ribbons or strings on toys.','Никаких ленточек и верёвок на игрушках.']},
  button:{t:'Press and listen', ru:'Нажми — и звучит', min:'3 min',
    steps:[['button1','A drum or a toy with big buttons and sounds.','Барабан или игрушка с крупными кнопками и звуком.'],
           ['button2','Show once, then wait. He presses — music!','Покажите один раз и ждите. Он нажимает — музыка!']],
    say:[['Press it!','Нажми!'],['Listen! Music!','Слушай! Музыка!']], rw:['good']},
  mirror:{t:'Mirror', ru:'Зеркало', min:'3 min',
    steps:[['mirror1','Unbreakable mirror fixed to the wall. “Who is this? Lev!”','Небьющееся зеркало на стене. «Кто это? Лёва!»'],
           ['mirror2','Point: “Where is your nose? Here!”','Покажите: «Где носик? Вот!»']],
    say:[['Who is this? It’s Lev!','Кто это? Это Лёва!'],['Where is your nose?','Где носик?']], rw:['where']},

  ballroll:{t:'Roll the ball', ru:'Мяч друг другу', min:'5 min', must:true,
    steps:[['roll1','Both babies sit facing each other on the mat. You sit between them.','Оба малыша сидят на коврике лицом друг к другу, вы между ними.'],
           ['roll2','Roll a big soft ball to one baby.','Прокатите большой мягкий мяч одному малышу.'],
           ['roll3','Help him roll it to his brother. Say each name.','Помогите ему прокатить мяч брату. Называйте каждого по имени.']],
    say:[['Lev, catch the ball!','Лёва, лови!'],['Roll it to Mark!','Кати Марку!'],['Wow, good job!','Ура, молодец!']], rw:['good','give']},
  peek:{t:'Peekaboo', ru:'Ку-ку', min:'3 min', must:true,
    steps:[['peek1','Hide your face behind your hands or a cloth.','Спрячьте лицо за ладонями или платком.'],
           ['peek2','Wait — then open: “Peekaboo!”','Подождите — и откройте: «Ку-ку!»'],
           ['peek3','Now let the babies hide.','Теперь пусть прячутся малыши.']],
    say:[['Where is Nanny?','Где няня?'],['Peekaboo!','Ку-ку!']], rw:['where']},
  songs:{t:'Clapping songs', ru:'Песенки с хлопками', min:'5 min', must:true,
    steps:[['song1','Every day the same songs: Pat-a-cake, This little piggy, Itsy-bitsy spider, Wheels on the bus.','Каждый день одни и те же песенки.'],
           ['song2','Show the hand moves slowly.','Показывайте движения рук медленно.'],
           ['song3','Wait — let them clap or move by themselves.','Подождите — пусть хлопают и двигаются сами.']],
    note:['Filipino baby songs are good too. The family does the Russian rhymes.','Филиппинские детские песни тоже хорошо. Русские потешки — за семьёй.'],
    say:[['Pat-a-cake, pat-a-cake…','Ладушки, ладушки…'],['Clap, clap, clap!','Хлоп, хлоп!']], rw:['good']},
  copy:{t:'Copy me', ru:'Повторяй за мной', min:'3 min',
    steps:[['copy1','Clap, wave bye-bye, shake your head — slowly, with a smile.','Хлопайте, машите «пока», качайте головой — медленно, с улыбкой.'],
           ['copy2','Wait. When he copies — praise him.','Подождите. Повторил — похвалите.']],
    say:[['Do like me!','Делай как я!'],['Bye-bye!','Пока-пока!']], rw:['good']},
  give:{t:'Give and take', ru:'Дай — на', min:'3 min',
    steps:[['give1','Pass a toy to one baby: “Here you are.”','Дайте игрушку одному малышу: «На».'],
           ['give2','Hold out your hand: “Give me, please.”','Протяните руку: «Дай, пожалуйста».'],
           ['give3','Say “Thank you!” Then pass it to the other baby.','Скажите «Спасибо!» и передайте другому малышу.']],
    say:[['Here you are.','На.'],['Give me, please.','Дай, пожалуйста.'],['Thank you!','Спасибо!']], rw:['give','here']},
  theme:{t:'Theme of the day', ru:'Тема дня', min:'10–15 min', steps:[], say:[['Cold! Wet! Soft!','Холодно! Мокро! Мягко!']], rw:[]},

  walk:{t:'Walk and talk', ru:'Прогулка и разговор', min:'walk time',
    steps:[['walk1','Name everything you see: car, dog, tree, bird, bus.','Называйте всё вокруг: машина, собака, дерево, птица, автобус.'],
           ['walk2','Stop and let him look and touch: a leaf, snow, a fence.','Остановитесь, дайте посмотреть и потрогать: листик, снег, забор.'],
           ['walk3','Not more than 1 hour in the pram without a break.','Не больше часа в коляске без перерыва.']],
    say:[['Look, a car! Beep-beep!','Смотри, машина! Би-би!'],['A dog! Woof-woof!','Собачка! Гав-гав!'],['Big tree!','Большое дерево!']], rw:[],
    safe:['Winter: layers, check the back of the neck — warm and dry is right. Snood, never a scarf.','Зимой: слои одежды, проверять шею сзади — тёплая и сухая. Снуд, не шарф.']},
  bath:{t:'Bath play', ru:'Игра в ванне', min:'5–10 min', one:true,
    steps:[['bath1','One baby at a time. One hand on the baby all the time.','По одному малышу. Одна рука всё время на ребёнке.'],
           ['bath2','Warm, not hot. 5–10 minutes. No bubble bath.','Тёплая вода, не горячая. 5–10 минут. Без пены.'],
           ['bath3','Pat dry and put the cream on straight away.','Промокнуть полотенцем и сразу нанести крем.']],
    say:[['Splash, splash!','Плюх, плюх!'],['Where are your toes? Here!','Где пальчики? Вот!']], rw:['where'],
    safe:['Never leave a baby in or near water — not even 1 second.','Никогда не оставлять малыша в воде или рядом — ни на секунду.']},
  calm:{t:'Quiet time', ru:'Спокойное время', min:'30 min before sleep',
    steps:[['calm1','No active games in the 30 minutes before sleep.','За 30 минут до сна — никаких активных игр.'],
           ['calm2','Dim light, slow voice, cuddle. A short song — the same one every time.','Приглушённый свет, тихий голос, объятия. Одна и та же короткая песенка.']],
    say:[['Time to rest.','Пора отдыхать.'],['Shh… nice and quiet.','Тише… спокойно.']], rw:[]},
  bedbook:{t:'Bedtime book and song', ru:'Книжка и колыбельная', min:'10 min', must:true,
    steps:[['bed1','After bath and bottle: brush teeth (toothpaste — as parents say).','После ванны и бутылочки — почистить зубы (пасту — как скажут родители).'],
           ['bed2','The same book every night. Slow voice.','Каждый вечер одна и та же книжка. Медленным голосом.'],
           ['bed3','A lullaby. Put him in the cot awake but sleepy. No bottle in the cot.','Колыбельная. В кроватку сонным, но не спящим. Без бутылочки в кроватке.']],
    say:[['Night-night, Lev.','Спокойной ночи, Лёва.'],['I love you. Sleep well.','Я тебя люблю. Спи сладко.']], rw:['night']},
};

const THEMES = [
  ['Family day: photo album — “Where is Mama? Where is Papa? Where are the sisters?”','Семейный день: фотоальбом — «Где мама? Где папа? Где сестрички?»'],
  ['Water: basin on a towel, max 2–3 cm warm water. Cups, sponge, floating toys. One adult = one baby. Empty the basin right after.','Вода: тазик на полотенце, 2–3 см тёплой воды. Стаканчики, губка, игрушки. Один взрослый — один ребёнок. Сразу вылить воду.'],
  ['Textures: fabric pieces sewn onto one big cloth (fur, silk, towel). Walk barefoot on a rug, a blanket, a towel.','Фактуры: лоскутки, пришитые к большой ткани. Босиком по ковру, пледу, полотенцу.'],
  ['Music: pots and wooden spoons, a baby rattle, dancing in your arms, clapping to the beat.','Музыка: кастрюли и ложки, погремушка, танцы на руках, хлопки в ритм.'],
  ['Sounds: crumple big sheets of plain paper. Pick up all pieces at once.','Звуки: мять большие листы бумаги. Сразу собрать все кусочки.'],
  ['Balls: big soft balls (5 cm or more) — roll, throw into a basket.','Мячи: крупные мягкие мячи (от 5 см) — катать, бросать в корзину.'],
  ['Food feel: touch and smell foods the parents already gave (banana, cucumber). Wipe hands after.','Еда на ощупь: трогать и нюхать знакомые продукты (банан, огурец). Потом вытереть руки.']];

const MOMENTS = [
  {id:'woke',  t:'Just woke up', ru:'Проснулся', sub:['Move: floor and sofa games','Двигаемся: коврик и диван'], col:'#E6F4EF', ic:'cruise1',
   note:['green','Fed and happy? Move! On the soft mat, 1 m from corners. Barefoot or non-slip socks.','Сыт и в настроении — двигаемся! На коврике, в метре от углов. Босиком или в нескользящих носках.'],
   ex:['floor','cruise','squat','handwalk','course','push','stand']},
  {id:'meal',  t:'Eating', ru:'Еда', sub:['Pieces, cup, spoon','Кусочки, чашка, ложка'], col:'#FFF3DC', ic:'fin1',
   note:['amber','Both strapped in high chairs, side by side, within your arm’s reach. Never leave the room.','Оба пристёгнуты в стульчиках рядом, в зоне вашей руки. Не выходить из комнаты.'],
   ex:['finger','cupspoon']},
  {id:'after', t:'Sitting play', ru:'Игры сидя', sub:['After eating, when calm','После еды, когда спокоен'], col:'#FDF0E1', ic:'book1',
   note:['blue','Calm games sitting on the floor or on your lap. A picture book every day is a MUST.','Спокойные игры сидя на полу или на коленях. Книжка каждый день — обязательно.'],
   ex:['book','box','hide','bucket','cups','bang','towel','button','mirror']},
  {id:'both',  t:'Both awake', ru:'Оба не спят', sub:['Play together','Играем вместе'], col:'#F6E9F0', ic:'roll2',
   note:['amber','Both babies and you on the mat — this is your main game. Call each by his name.','Оба малыша и вы на коврике — это ваша главная игра. Называйте каждого по имени.'],
   ex:['ballroll','peek','songs','copy','give','theme']},
  {id:'walk',  t:'Walk', ru:'Прогулка', sub:['Talk about everything','Разговариваем обо всём'], col:'#EEF3E6', ic:'walk1',
   note:['green','Not more than 1 hour in the pram without a break.','Не больше часа в коляске без перерыва.'], ex:['walk']},
  {id:'bath',  t:'Bath', ru:'Ванна', sub:['One adult = one baby','Один взрослый — один ребёнок'], col:'#E9F1F8', ic:'bath1',
   note:['red','One adult = one baby. Never bathe both at once alone.','Один взрослый — один ребёнок. Не купать двоих одной.'], ex:['bath']},
  {id:'sleep', t:'Before sleep', ru:'Перед сном', sub:['Only calm','Только спокойное'], col:'#ECEAF6', ic:'calm2',
   note:['blue','No active games in the 30 minutes before a nap or the night.','За 30 минут до сна — никаких активных игр.'], ex:['calm','bedbook']},
];
const MOM = Object.fromEntries(MOMENTS.map(m=>[m.id,m]));
const MUSTS = [
  {t:'Move', ru:'Движение', test:(d,c)=>MOM.woke.ex.some(e=>d[c+'|'+e])},
  {t:'Book', ru:'Книжка', test:(d,c)=>!!d[c+'|book']},
  {t:'Play together', ru:'Вместе', test:(d,c)=>MOM.both.ex.some(e=>d[c+'|'+e])},
  {t:'Bedtime book', ru:'Перед сном', test:(d,c)=>!!d[c+'|bedbook']},
];

// ── state & storage ────────────────────────────────────────────
const S = { screen:'home', moment:null, ex:null, done:{}, local:false };
function lsGet(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); }catch(e){ return {}; } }
function lsSet(o){ try{ localStorage.setItem(LS_KEY, JSON.stringify(o)); }catch(e){} }
async function loadDone(){
  const day = todayISO(); S.done = {};
  try{
    const { data, error } = await db.from(T_DEV).select('id,child,activity').eq('date', day);
    if (error) throw error;
    S.local = false; (data||[]).forEach(r => { S.done[r.child+'|'+r.activity] = r.id; });
  }catch(e){
    S.local = true; const d = lsGet()[day] || {}; Object.keys(d).forEach(k => { S.done[k] = 'local'; });
  }
}
async function toggle(c, exId){
  const key = c+'|'+exId, day = todayISO();
  if (S.local){
    const all = lsGet(); all[day] = all[day] || {};
    if (S.done[key]) { delete all[day][key]; delete S.done[key]; } else { all[day][key] = new Date().toISOString(); S.done[key]='local'; }
    lsSet(all); render(); return;
  }
  try{
    if (S.done[key]){
      const { error } = await db.from(T_DEV).delete().eq('id', S.done[key]); if (error) throw error; delete S.done[key];
    } else {
      const { data, error } = await db.from(T_DEV).insert({ child:c, date:day, activity:exId }).select('id').single(); if (error) throw error;
      S.done[key] = data.id; if (typeof showToast==='function') showToast(`✓ ${KIDS[c].en} · ${EX[exId].t}`);
    }
  }catch(e){ if (typeof showToast==='function') showToast('Not saved — check internet / Не сохранено'); }
  render();
}

// ── baby status from the sleep log ─────────────────────────────
async function babyNow(){
  const day = todayISO(); const prev = (()=>{ const d=new Date(); d.setDate(d.getDate()-1); return dateISO(d); })();
  const out = {};
  try{
    const [sl, fo, so] = await Promise.all([
      db.from(T_SLEEP).select('child,start_time,end_time').gte('date',prev).lte('date',day),
      db.from(T_FORMULA).select('child,date,time,nutrilon_ml,kabrita_ml').eq('date',day),
      db.from(T_SOLIDS).select('child,date,time').eq('date',day),
    ]);
    const now = Date.now();
    ['lev','mark'].forEach(c => {
      const rows = (sl.data||[]).filter(r=>r.child===c && r.start_time).sort((a,b)=>a.start_time.localeCompare(b.start_time));
      const last = rows[rows.length-1];
      const meals = [...(fo.data||[]).filter(r=>r.child===c && ((r.nutrilon_ml||0)+(r.kabrita_ml||0))>0), ...(so.data||[]).filter(r=>r.child===c)]
        .map(r => new Date(`${r.date}T${String(r.time||'00:00').slice(0,5)}:00`).getTime()).filter(t=>t<=now).sort((a,b)=>a-b);
      const lastMeal = meals.length ? meals[meals.length-1] : null;
      if (last && !last.end_time){ out[c] = {sleeping:true, since:new Date(last.start_time)}; return; }
      const awakeMin = last && last.end_time ? Math.round((now - new Date(last.end_time).getTime())/60000) : null;
      const mealMin = lastMeal ? Math.round((now-lastMeal)/60000) : null;
      let m = 'after';
      if (awakeMin!==null && awakeMin <= 40) m = 'woke';
      else if (mealMin!==null && mealMin <= 30) m = 'after';
      else if (awakeMin!==null && awakeMin >= 150) m = 'sleep';
      out[c] = {sleeping:false, awakeMin, moment:m};
    });
  }catch(e){}
  return out;
}
function fmtMin(m){ if (m===null||m===undefined) return ''; if (m<60) return m+' min'; const h=Math.floor(m/60), r=m%60; return h+' h'+(r?' '+r+' min':''); }

// ── render ─────────────────────────────────────────────────────
const root = () => document.getElementById('dev-root');
const bi = (en, ru, cls='') => `<span class="dv-en ${cls}">${en}</span><span class="dv-ru">${ru}</span>`;
function badges(exId){ return `<span class="dv-badges">${['lev','mark'].map(c=>`<span class="dv-bd ${c} ${S.done[c+'|'+exId]?'on':''}">${S.done[c+'|'+exId]?'✓':c==='lev'?'L':'M'}</span>`).join('')}</span>`; }
function tags(e){ return (e.must?'<span class="dv-tag must">MUST</span>':'')+(e.one?'<span class="dv-tag one">1 adult = 1 baby</span>':'')+(e.later?'<span class="dv-tag later">12–15 mo</span>':''); }
function syncNote(){ return S.local ? `<div class="dv-sync">${bi('Ticks are saved on this phone only.','Отметки пока сохраняются только на этом телефоне.')}</div>` : ''; }
function videos(id){
  const list = VID[id]; if (!list) return '';
  return `<div class="dv-sec">Watch a video <span class="ru">· посмотреть видео</span></div>${list.map(v=>`<a class="dv-vid" href="${v.u}" target="_blank" rel="noopener"><span class="pl">▶</span><span class="tx"><b>${v.t}</b><small>${v.src} · ${v.len}</small></span></a>`).join('')}`;
}

async function renderHome(){
  const r = root(); if (!r) return;
  r.innerHTML = `<div class="loading">Loading… / Загрузка…</div>`;
  const [nowInfo] = await Promise.all([babyNow(), loadDone()]);
  const kid = (c) => {
    const n = nowInfo[c]; const k = KIDS[c]; let st, go;
    if (n && n.sleeping){ st = bi(`Sleeping since ${n.since.toTimeString().slice(0,5)}`,'Спит'); go = `<button class="k-go" onclick="devOpenMoment('woke')">When he wakes up →<small>Проснулся</small></button>`; }
    else if (n){ const m = MOM[n.moment]; st = bi(n.awakeMin!==null ? `Awake ${fmtMin(n.awakeMin)}` : 'Awake','Не спит'); go = `<button class="k-go" onclick="devOpenMoment('${m.id}')">${m.t} →<small>${m.ru}</small></button>`; }
    else { st = ''; go = `<button class="k-go" onclick="devOpenMoment('woke')">Choose below ↓<small>Выберите ниже</small></button>`; }
    return `<div class="dv-kid ${c}"><div class="k-name"><img src="${k.img}" alt="">${k.en} <span style="font-weight:500;color:var(--hint);font-size:12px">${k.ru}</span></div><div class="k-st">${st}</div>${go}</div>`;
  };
  const bothAwake = nowInfo.lev && nowInfo.mark && !nowInfo.lev.sleeping && !nowInfo.mark.sleeping;
  r.innerHTML = `
    <div class="dv-h1">Development · Развитие</div>
    <div class="dv-sub">${bi('Short games, 3–7 min. Stop if he cries or turns away. Missing a game is OK.','Короткие игры по 3–7 минут. Плачет или отворачивается — заканчиваем. Пропустить игру — нормально.')}</div>
    ${syncNote()}
    <div class="dv-now">${kid('lev')}${kid('mark')}</div>
    ${bothAwake ? `<button class="dv-both" onclick="devOpenMoment('both')">${PIC_MINI_BOTH} <span>Both awake → Play together<small>Оба не спят → играем вместе</small></span><span style="margin-left:auto">›</span></button>` : ''}
    <div class="dv-sec">Today’s 4 must-dos <span class="ru">· обязательно сегодня</span></div>
    <div class="dv-card"><div class="dv-must"><span></span>${MUSTS.map(m=>`<span class="mh">${m.t}<br><i>${m.ru}</i></span>`).join('')}
      ${['lev','mark'].map(c=>`<span class="mk ${c}">${KIDS[c].en}</span>${MUSTS.map(m=>{const on=m.test(S.done,c);return `<span class="md ${c} ${on?'on':''}">${on?'✓':''}</span>`;}).join('')}`).join('')}</div></div>
    <div class="dv-sec">Moments of the day <span class="ru">· моменты дня</span></div>
    <div class="dv-moments">${MOMENTS.map(m=>`<button class="dv-mom" onclick="devOpenMoment('${m.id}')"><span class="mi" style="background:${m.col}">${thumb(m.ic)}</span><b>${m.t}</b><span class="mru">${m.ru}</span><small>${m.sub[0]}<br><i>${m.sub[1]}</i></small></button>`).join('')}</div>
    <div class="dv-sec">All day <span class="ru">· весь день</span></div>
    <div class="dv-card">
      <b style="font-size:15px">Talk all day — in English</b><div class="dv-ru">Весь день разговаривайте — по-английски</div>
      <ul class="dv-tips">
        <li>${bi('<b>Say what you do:</b> “Sock on. One sock. Two socks!”','Говорите, что делаете: «Надеваем носок. Один. Второй!»')}</li>
        <li>${bi('<b>Wait 5 seconds</b> after a question. Smile, look in his eyes.','После вопроса подождите 5 секунд, улыбнитесь, смотрите в глаза.')}</li>
        <li>${bi('<b>Say it back + one word:</b> he says “ba” → “Ba! Ball! Big ball!”','Повторите + одно слово: «ба» → «Ба! Мяч! Большой мяч!»')}</li>
        <li>${bi('<b>Call him Lev or Mark</b> — never “the twins”.','Называйте Лёва или Марк, не «близнецы».')}</li>
      </ul>
    </div>
    <button class="dv-item" onclick="devRules()"><span class="th" style="background:#FDEDEC;font-size:22px">📋</span><span class="tx"><b>Rules and safety</b><small>Правила и безопасность</small></span><span>›</span></button>
    <button class="dv-item" onclick="devRedFlags()"><span class="th" style="background:#FFF3DC;font-size:22px">👀</span><span class="tx"><b>Tell the parents if…</b><small>Когда сказать родителям</small></span><span>›</span></button>`;
}
const PIC_MINI_BOTH = '<span style="font-size:20px">👶👶</span>';

function renderMoment(){
  const r = root(); const m = MOM[S.moment]; if (!r||!m) return;
  r.innerHTML = `
    <div class="dv-h1">${m.t}</div>
    <div class="dv-sub">${m.ru} · ${m.sub[0]} · ${m.sub[1]}</div>
    ${syncNote()}
    <div class="dv-note ${m.note[0]}">${bi(m.note[1],m.note[2])}</div>
    ${m.ex.map(id=>{const e=EX[id];const pic=(e.steps[0]||['theme'])[0];return `<button class="dv-item" onclick="devOpenEx('${id}')"><span class="th big">${thumb(pic)}</span><span class="tx"><b>${e.t}${tags(e)}</b><small>${e.ru} · ${e.min}${VID[id]?' · ▶ video':''}</small></span>${badges(id)}</button>`;}).join('')}`;
}

function renderEx(){
  const r = root(); const e = EX[S.ex]; if (!r||!e) return;
  const isTheme = S.ex==='theme';
  const steps = isTheme ? [['theme', ...THEMES[new Date().getDay()]]] : e.steps;
  const rw = (e.rw||[]).map(k=>RW[k]).filter(Boolean);
  r.innerHTML = `
    <div class="dv-ex-t">${e.t}${tags(e)}</div>
    <div class="dv-ex-ru">${e.ru} · ${e.min}</div>
    ${e.note ? `<div class="dv-note blue">${bi(e.note[0],e.note[1])}</div>` : ''}
    ${steps.map((s,i)=>`<div class="dv-step"><div class="sp">${P[s[0]] ? P[s[0]]() : ''}</div><div class="st"><span class="n">${i+1}</span><span>${bi(s[1],s[2])}</span></div></div>`).join('')}
    ${e.plan ? `<div class="dv-note amber"><b>From puree to pieces · От пюре к кусочкам</b>${e.plan.map(p=>`<div style="margin-top:4px">${bi(p[0],p[1])}</div>`).join('')}</div>` : ''}
    ${e.harder ? `<div class="dv-step harder"><div class="sp">${P[e.harder[0]]()}</div><div class="st"><span class="n">+</span><span>${bi(e.harder[1],e.harder[2])}</span></div></div>` : ''}
    <div class="dv-say"><div class="sh">SAY · ГОВОРИТЕ</div>
      ${e.say.map(p=>`<div class="ph">“${p[0]}”<span class="dv-ru">${p[1]}</span></div>`).join('')}
      ${rw.length ? `<div class="rw"><span class="rwh">Russian words · русские слова</span>${rw.map(w=>`<b>${w[0]}</b><span>${w[1]} — ${w[2]}</span>`).join('')}</div>` : ''}
    </div>
    ${e.safe ? `<div class="dv-note red"><b>Safety · Безопасность:</b> ${bi(e.safe[0],e.safe[1])}</div>` : ''}
    ${e.one ? `<div class="dv-note red">${bi('<b>One adult = one baby.</b> The other baby is with the second nanny, or in the playpen where you can see him. Alone with both? Skip this one.','Один взрослый — один ребёнок. Второй малыш со второй няней или в манеже на виду. Одна с двумя — пропустите это упражнение.')}</div>` : ''}
    ${videos(S.ex)}
    ${syncNote()}
    <div class="dv-done">
      <button class="lev ${S.done['lev|'+S.ex]?'on':''}" onclick="devToggle('lev')">${S.done['lev|'+S.ex]?'✓ ':''}Lev done<small>Лёва — сделано</small></button>
      <button class="mark ${S.done['mark|'+S.ex]?'on':''}" onclick="devToggle('mark')">${S.done['mark|'+S.ex]?'✓ ':''}Mark done<small>Марк — сделано</small></button>
    </div>`;
}
function render(){ if (S.screen==='home') return renderHome(); if (S.screen==='moment') return renderMoment(); if (S.screen==='ex') return renderEx(); }
function sheet(html){
  const m = document.createElement('div'); m.className = 'dv-modal';
  m.onclick = (ev) => { if (ev.target===m) m.remove(); };
  m.innerHTML = `<div class="dv-sheet" role="dialog" aria-modal="true">${html}<button class="close" onclick="this.closest('.dv-modal').remove()">Close · Закрыть</button></div>`;
  document.body.appendChild(m);
}

// ── public API ─────────────────────────────────────────────────
window.renderDev = async function(){ S.screen='home'; S.moment=null; S.ex=null; await render(); };
window.devOpenMoment = function(id){ S.screen='moment'; S.moment=id; window.scrollTo(0,0); render(); };
window.devOpenEx = function(id){ S.screen='ex'; S.ex=id; window.scrollTo(0,0); render(); };
window.devToggle = function(c){ toggle(c, S.ex); };
window.devBack = function(){
  if (S.screen==='ex' && S.moment){ S.screen='moment'; window.scrollTo(0,0); return render(); }
  if (S.screen!=='home'){ S.screen='home'; window.scrollTo(0,0); return render(); }
  goHome();
};
window.devRules = function(){
  const L = [
    ['<b>Short and often:</b> 3–7 min. Stop when he cries, turns away or rubs his eyes.','Коротко и часто: 3–7 минут. Плачет, отворачивается, трёт глаза — стоп.'],
    ['<b>Only when fed and rested.</b> Calm only, 30 min before sleep.','Только сытым и отдохнувшим. За 30 минут до сна — только спокойное.'],
    ['<b>Talk all day in English.</b> Short sentences.','Весь день говорите по-английски, короткими фразами.'],
    ['<b>Let him try himself.</b> Help only as much as needed.','Дайте сделать самому, помогайте ровно сколько нужно.'],
    ['<b>One adult = one baby:</b> water, bath, climbing, steps holding hands, push toy.','Один взрослый — один ребёнок: вода, ванна, лазание, шаги за руку, каталка.'],
    ['<b>Floor time is the main play.</b> Pram, high chair, carrier — max 1 hour at a time.','Главная игра — на полу. Коляска, стульчик, переноска — не больше часа подряд.'],
    ['<b>One-to-one time with each baby is the parents’ time.</b> Nannies: play with both together.','Время один на один с каждым — родительское. Няни играют с обоими вместе.'],
    ['<b>No screens</b> for the babies. Video calls with family are OK.','Никаких экранов. Видеозвонки с семьёй — можно.'],
    ['<b>Small things:</b> if it goes through a toilet-paper tube, it is dangerous. Check the floor: Lego, beads, coins, button batteries.','Мелочи: всё, что проходит во втулку от туалетной бумаги, опасно. Проверяйте пол: конструктор, бусины, монеты, батарейки.'],
    ['<b>Cords:</b> nothing longer than 18 cm near the babies.','Шнуры: ничего длиннее 18 см рядом с малышами.'],
    ['<b>Water:</b> never leave a baby near water, even a basin.','Вода: никогда не оставлять малыша рядом с водой, даже с тазиком.'],
    ['<b>Falls:</b> fall on the head, vomiting or sleepiness after → tell the parents at once.','Падение на голову, рвота или сонливость после — сразу сказать родителям.'],
  ];
  sheet(`<h3>Rules and safety · Правила</h3><ol class="dv-ol">${L.map(x=>`<li>${bi(x[0],x[1])}</li>`).join('')}</ol>`);
};
window.devRedFlags = function(){
  const L = [
    ['does not pull up to stand or hold furniture to walk','не встаёт у опоры и не ходит вдоль мебели'],
    ['does not crawl or move around in any way','не ползает и никак не перемещается'],
    ['does not babble (“ma”, “ba”, “da”), does not say “mama/papa” to anyone','не лепечет («ма», «ба», «да»), ни к кому не говорит «мама/папа»'],
    ['does not wave bye-bye or reach up to be picked up','не машет «пока», не тянет руки, чтобы взяли'],
    ['does not turn to his name or to sounds; rarely looks in your eyes','не реагирует на имя и звуки, редко смотрит в глаза'],
    ['does not look where you point; does not play pat-a-cake or peekaboo','не смотрит туда, куда вы показываете; не играет в ладушки и ку-ку'],
    ['does not look for a toy you hid while he watched','не ищет игрушку, спрятанную у него на глазах'],
    ['does not pick up small pieces with 2 fingers','не берёт мелкие кусочки двумя пальцами'],
    ['uses mostly one hand or one side of the body','пользуется в основном одной рукой или одной стороной тела'],
    ['<b>stops doing something he could do before</b>','перестал делать то, что уже умел'],
    ['anything else that worries you','всё, что вас беспокоит'],
  ];
  sheet(`<h3>Tell the parents the same day if a baby… · Сказать родителям в тот же день, если малыш…</h3><ul class="dv-ol">${L.map(x=>`<li>${bi(x[0],x[1])}</li>`).join('')}</ul>
    <div class="dv-note blue" style="margin-top:8px">${bi('These are reasons for the parents to talk to the doctor — not a diagnosis.','Это повод родителям поговорить с врачом, а не диагноз.')}</div>`);
};
window.devHomeHint = async function(){
  const el = document.getElementById('dev-home-hint'); if (!el) return;
  const n = await babyNow();
  const part = c => { const x=n[c]; if (!x) return ''; if (x.sleeping) return `${KIDS[c].en}: sleeping`; return `${KIDS[c].en} → ${MOM[x.moment].t}`; };
  el.textContent = [part('lev'),part('mark')].filter(Boolean).join(' · ') || 'Games & exercises · Игры и упражнения';
};
})();
