const PAL={_:'transparent',R:'#f21428',r:'#8c0a18',S:'#fdd9b5',s:'#dba878',G:'#1ed44a',W:'#ffffff',E:'#1a1028',p:'#ff9898',m:'#cc4040',K:'#ff79c6',k:'#c0448c',N:'#5a6aaa',n:'#3a4878',L:'#fdd9b5',B:'#181828',A:'#fdd9b5'};
const F0=['___RRRRRRRR___','__RRRrrrrRR___','___RSSSSSSR___','____SSSSSS____','____SEESEE____','____SGWSGW____','____SSSSSS____','____SpSSpS____','____SSmmSS____','____SSSSSS____','____SKKKKS____','___KKKKKKK____','A__KKKKKK_____','A__KKKKKKK____','___KKKKKKK____','___NNNNNNN____','__NNNNNNNNN___','__nNNNNNNNn___','____LL__LL____','____LL__LL____','___BBB__BBB___','___BBB__BBB___'];
const F1=['A___RRRRRRRR__','_A__RRRrrrrRR_','__A_RSSSSSSR__','____SSSSSS____','____SEESEE____','____SGWSGW____','____SSSSSS____','____SpSSpS____','____SSmmSS____','____SSSSSS____','____SKKKKS____','___KKKKKKK____','___KKKKKK_____','___KKKKKKK____','___KKKKKKK____','___NNNNNNN____','__NNNNNNNNN___','__nNNNNNNNn___','____LL__LL____','____LL__LL____','___BBB__BBB___','___BBB__BBB___'];
const GP={_:'transparent',g:'#4a7c59',G:'#3a6a47',b:'#5a3e28',d:'#3a2818'};
const GROUND=['gGgGGgGgGgGgGG','bbbbbbbbbbbbbb','dddddddddddddd','dddddddddddddd'];
const SPEECHES=["hi! (˶ᵔᵕᵔ˶)","uwu~","♡ cute!","kawaii~","⭐ hehe","wave~!","♪ ♫","pixel gal!"];
let frame=0,isBlinking=false,speech=null,bounce=false,speechIdx=0;

function drawMascot(){
  const cvs=document.getElementById('mascotCanvas');
  if(!cvs)return;
  const ctx=cvs.getContext('2d');
  const sz=4;
  const sprite=isBlinking?(frame===0?F0:F1).map((r,i)=>(i===4||i===5)?'____SSSSSS____':r):(frame===0?F0:F1);
  
  ctx.clearRect(0,0,cvs.width,cvs.height);
  
  // speech bubble
  if(speech){
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.roundRect(10,5,90,28,6);
    ctx.fill();
    ctx.fillStyle='#222';
    ctx.font='bold 10px sans-serif';
    ctx.fillText(speech,55,24);
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.moveTo(45,33);ctx.lineTo(55,33);ctx.lineTo(50,38);
    ctx.fill();
  }
  
  // bounce offset
  const offY=bounce?-4:0;
  
  // draw sprite
  sprite.forEach((row,ri)=>{
    row.split('').forEach((ch,ci)=>{
      if(PAL[ch]&&PAL[ch]!=='transparent'){
        ctx.fillStyle=PAL[ch];
        ctx.fillRect(20+ci*sz,40+ri*sz+offY,sz,sz);
      }
    });
  });
  
  // draw ground
  GROUND.forEach((row,ri)=>{
    row.split('').forEach((ch,ci)=>{
      if(GP[ch]&&GP[ch]!=='transparent'){
        ctx.fillStyle=GP[ch];
        ctx.fillRect(20+ci*sz,130+ri*sz,sz,sz);
      }
    });
  });
}

function startMascot(){
  setInterval(()=>{frame=1-frame;drawMascot();},580);
  setInterval(()=>{isBlinking=true;drawMascot();setTimeout(()=>{isBlinking=false;drawMascot();},150);},3800);
  setInterval(()=>{speech=SPEECHES[speechIdx%SPEECHES.length];speechIdx++;drawMascot();setTimeout(()=>{speech=null;drawMascot();},2400);},8000);
  setInterval(()=>{bounce=true;drawMascot();setTimeout(()=>{bounce=false;drawMascot();},420);},1400);
  drawMascot();
}
