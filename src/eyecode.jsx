import { useState, useEffect, useRef } from "react";

const API = "https://api.anthropic.com/v1/messages";
const G = "#00ff88", C = "#00d4ff", R = "#ff3366";
const DIM = "rgba(0,255,136,0.35)", BG = "#060a08";
const SURF = "rgba(0,255,136,0.03)", BORDER = "rgba(0,255,136,0.14)";
const FONT = "'JetBrains Mono','Fira Code','Courier New',monospace";

const STEPS = ["Connecting to target...","Resolving DOM...","Scanning stylesheets...","Extracting colors...","Analyzing typography...","Mapping components...","Identifying UX patterns...","Detecting tech stack...","Accessibility audit...","Reconstructing HTML...","Compiling report..."];

const DEMO = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;min-height:100vh;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);display:flex;align-items:center;justify-content:center;color:#fff}
.card{background:rgba(255,255,255,0.07);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:48px;max-width:440px;width:90%;text-align:center}
h1{font-size:2.4rem;margin-bottom:12px}p{color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:28px}
button{background:linear-gradient(135deg,#667eea,#764ba2);border:none;color:#fff;font-size:15px;padding:14px 32px;border-radius:50px;cursor:pointer;transition:transform 0.2s}
button:hover{transform:translateY(-2px)}
</style></head><body>
<div class="card"><h1>✨ Hello World</h1>
<p>Paste any HTML here and click <strong>Render Preview</strong> to see your UI live.</p>
<button onclick="this.textContent='🎉 It works!'">Click me</button></div>
</body></html>`;

function makeCSSVars(c={}) {
  const l=[":root {"];
  Object.entries(c).forEach(([k,v])=>{if(k!=="palette"&&v)l.push(`  --color-${k}: ${v};`)});
  (c.palette||[]).forEach((v,i)=>l.push(`  --palette-${i+1}: ${v};`));
  l.push("}"); return l.join("\n");
}
function dl(name,content,mime="text/plain"){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type:mime}));
  a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
async function extract(url){
  const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    model:"claude-sonnet-4-20250514",max_tokens:4000,
    tools:[{type:"web_search_20250305",name:"web_search"}],
    system:`You are eyecode.exe. Search the URL and return ONLY raw JSON, no markdown, no backticks, no explanation. Schema: {"title":"","description":"","colors":{"primary":"#hex","secondary":"#hex","background":"#hex","text":"#hex","accent":"#hex","palette":["#hex"]},"typography":{"headingFont":"","bodyFont":"","headingWeight":"700","baseSize":"16px","lineHeight":"1.6"},"layout":{"type":"","hasNav":true,"hasHero":true,"hasSidebar":false,"hasFooter":true,"responsive":true,"maxWidth":"1280px"},"components":[],"uxPatterns":[],"techStack":[],"accessibility":{"score":"","notes":""},"seo":{"hasMetaDescription":true,"hasOGTags":true,"hasCanonical":true},"performance":{"hasLazyLoading":true,"hasMinifiedAssets":true},"approximateHTML":"<!DOCTYPE html>...full reconstructed page..."}`,
    messages:[{role:"user",content:`Extract all UI/UX data from: ${url}`}]
  })});
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const d=await res.json();
  const text=d.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const m=text.match(/\{[\s\S]*\}/);
  if(!m) throw new Error("No JSON in response.\n\n"+text.slice(0,500));
  return JSON.parse(m[0]);
}

function Btn({onClick,active,danger,disabled,children}){
  const[h,sH]=useState(false);
  return(<button onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} onClick={onClick} disabled={disabled} style={{padding:"5px 12px",borderRadius:5,fontFamily:FONT,fontSize:10,letterSpacing:1,cursor:disabled?"not-allowed":"pointer",whiteSpace:"nowrap",transition:"all 0.12s",border:`1px solid ${danger?"rgba(255,51,102,0.4)":h||active?"rgba(0,255,136,0.55)":BORDER}`,background:danger?"rgba(255,51,102,0.08)":h||active?"rgba(0,255,136,0.12)":SURF,color:disabled?"rgba(0,255,136,0.2)":danger?R:h||active?G:DIM}}>{children}</button>);
}
function Row({label,value}){return(<div style={{display:"flex",gap:8,marginBottom:5,fontSize:11}}><span style={{color:DIM,minWidth:112,flexShrink:0,fontFamily:FONT}}>{label}:</span><span style={{color:"#b8ffd4",wordBreak:"break-word",fontFamily:FONT}}>{String(value??"—")}</span></div>);}
function Card({title,children,action}){return(<div style={{background:SURF,border:`1px solid ${BORDER}`,borderRadius:8,padding:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:9,color:"rgba(0,255,136,0.38)",letterSpacing:2,fontFamily:FONT}}>{title}</span>{action}</div>{children}</div>);}
function Pill({text,cyan}){return(<span style={{padding:"3px 9px",borderRadius:4,fontSize:10,fontFamily:FONT,background:cyan?"rgba(0,212,255,0.07)":"rgba(0,255,136,0.07)",border:`1px solid ${cyan?"rgba(0,212,255,0.25)":"rgba(0,255,136,0.2)"}`,color:cyan?C:G}}>{text}</span>);}
function Swatch({hex,label,onCopy}){
  const[h,sH]=useState(false);
  if(!hex)return null;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div onClick={()=>onCopy(hex)} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{width:48,height:48,borderRadius:7,background:hex,cursor:"pointer",border:"1px solid rgba(255,255,255,0.1)",transform:h?"scale(1.1)":"scale(1)",boxShadow:h?`0 4px 14px ${hex}66`:"none",transition:"all 0.12s"}} />{label&&<span style={{fontSize:8,color:DIM,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT}}>{label}</span>}<span style={{fontSize:9,color:"#8adfb4",fontFamily:FONT}}>{hex}</span></div>);
}

export default function EyeCode(){
  const[mode,setMode]=useState("extract");
  const[url,setUrl]=useState("");
  const[loading,setLoading]=useState(false);
  const[step,setStep]=useState(0);
  const[result,setResult]=useState(null);
  const[err,setErr]=useState(null);
  const[tab,setTab]=useState("overview");
  const[code,setCode]=useState(DEMO);
  const[live,setLive]=useState(false);
  const[device,setDevice]=useState("desktop");
  const[copied,setCopied]=useState({});
  const stepRef=useRef(null);

  useEffect(()=>{
    if(!document.querySelector("#eyecode-gf")){
      const l=document.createElement("link");
      l.id="eyecode-gf"; l.rel="stylesheet";
      l.href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap";
      document.head.appendChild(l);
    }
  },[]);

  const cp=(key,text)=>{
    navigator.clipboard.writeText(String(text||""));
    setCopied(c=>({...c,[key]:true}));
    setTimeout(()=>setCopied(c=>({...c,[key]:false})),2000);
  };

  const scan=async()=>{
    if(!url.trim()||loading)return;
    setLoading(true);setErr(null);setResult(null);setStep(0);
    let s=0;
    stepRef.current=setInterval(()=>{s=Math.min(s+1,STEPS.length-1);setStep(s);},750);
    try{const d=await extract(url.trim());setResult(d);setTab("overview");}
    catch(e){setErr(e.message);}
    finally{clearInterval(stepRef.current);setLoading(false);}
  };

  const upload=(e,target)=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      if(target==="preview"){setCode(ev.target.result);setLive(false);}
      else{const m=ev.target.result.match(/https?:\/\/[^\s"'<>]+/);if(m)setUrl(m[0]);}
    };
    r.readAsText(f);e.target.value="";
  };

  const json=result?JSON.stringify(result,null,2):"";
  const DW={desktop:"100%",tablet:768,mobile:390};

  const CSS=`
    @keyframes g1{0%,89%,100%{transform:none;opacity:0}91%{transform:translateX(-3px);opacity:.8}93%{transform:translateX(3px);opacity:.8}95%{opacity:0}}
    @keyframes g2{0%,84%,100%{transform:none;opacity:0}86%{transform:translateX(3px);opacity:.6}88%{transform:translateX(-3px);opacity:.6}90%{opacity:0}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes up{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
    @keyframes pg{0%,100%{box-shadow:0 0 4px #00ff88;opacity:1}50%{box-shadow:0 0 14px #00ff88;opacity:.4}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes scan{0%{top:-3px}100%{top:100%}}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:${BG}}
    ::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2);border-radius:2px}
    input,textarea{caret-color:#00ff88}
    input::placeholder{color:rgba(0,255,136,0.18)!important}
    textarea::placeholder{color:rgba(0,255,136,0.12)!important}
  `;

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",background:BG,color:"#b8ffd4",fontFamily:FONT,display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9998,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 3px)"}} />
      <div style={{position:"fixed",left:0,right:0,height:3,pointerEvents:"none",zIndex:9999,background:"linear-gradient(transparent,rgba(0,255,136,0.04),transparent)",animation:"scan 7s linear infinite"}} />

      {/* HEADER */}
      <header style={{padding:"0 18px",height:50,flexShrink:0,borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{position:"relative"}}>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:900,color:G,letterSpacing:3,textShadow:"0 0 16px rgba(0,255,136,0.4)"}}>eyecode<span style={{color:DIM}}>.exe</span></span>
            <span style={{position:"absolute",inset:0,fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:900,color:C,letterSpacing:3,clipPath:"polygon(0 20%,100% 20%,100% 50%,0 50%)",animation:"g1 6s infinite"}}>eyecode.exe</span>
            <span style={{position:"absolute",inset:0,fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:900,color:R,letterSpacing:3,clipPath:"polygon(0 62%,100% 62%,100% 80%,0 80%)",animation:"g2 6s infinite"}}>eyecode.exe</span>
          </div>
          <div style={{width:7,height:7,borderRadius:"50%",background:G,animation:"pg 2s ease-in-out infinite"}} />
          <span style={{fontSize:8,color:"rgba(0,255,136,0.25)",letterSpacing:3}}>WEB EXTRACTION ENGINE v1.0</span>
        </div>
        <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.5)",borderRadius:7,padding:4,border:`1px solid ${BORDER}`}}>
          {[{id:"extract",label:"⊳ EXTRACT"},{id:"preview",label:"⊳ PREVIEW"}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:"5px 16px",borderRadius:5,border:"none",cursor:"pointer",background:mode===m.id?"rgba(0,255,136,0.12)":"transparent",color:mode===m.id?G:DIM,fontFamily:FONT,fontSize:10,fontWeight:mode===m.id?700:400,letterSpacing:2,borderLeft:mode===m.id?`2px solid ${G}`:"2px solid transparent",transition:"all 0.12s"}}>{m.label}</button>
          ))}
        </div>
      </header>

      {/* EXTRACT MODE */}
      {mode==="extract"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"9px 16px",borderBottom:`1px solid ${BORDER}`,display:"flex",gap:7,alignItems:"center",background:"rgba(0,0,0,0.25)",flexShrink:0}}>
            <span style={{fontSize:9,color:"rgba(0,255,136,0.35)",letterSpacing:2,whiteSpace:"nowrap"}}>TARGET://</span>
            <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()} placeholder="https://stripe.com" style={{flex:1,background:"rgba(0,255,136,0.04)",border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 13px",color:"#c8ffdc",fontFamily:FONT,fontSize:13,outline:"none"}} />
            <Btn onClick={()=>cp("urlin",url)} active={copied.urlin}>{copied.urlin?"✓ COPIED":"⊕ COPY"}</Btn>
            <label style={{padding:"5px 12px",borderRadius:5,border:`1px solid ${BORDER}`,background:SURF,color:DIM,fontFamily:FONT,fontSize:10,letterSpacing:1,cursor:"pointer"}}>↑ UPLOAD<input type="file" accept=".html,.htm,.txt" onChange={e=>upload(e,"extract")} style={{display:"none"}} /></label>
            <button onClick={scan} disabled={loading||!url.trim()} style={{padding:"7px 20px",borderRadius:6,fontFamily:FONT,fontSize:11,fontWeight:700,letterSpacing:2,cursor:loading||!url.trim()?"not-allowed":"pointer",transition:"all 0.12s",border:`1px solid ${loading?"rgba(0,255,136,0.2)":G}`,background:loading?"rgba(0,255,136,0.04)":"rgba(0,255,136,0.12)",color:loading||!url.trim()?"rgba(0,255,136,0.25)":G,boxShadow:!loading&&url.trim()?"0 0 10px rgba(0,255,136,0.18)":"none"}}>
              {loading?<span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:9,height:9,border:`2px solid ${G}`,borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}} />SCANNING</span>:"▶ SCAN"}
            </button>
          </div>

          <div style={{flex:1,overflow:"auto",padding:16}}>
            {loading&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:260,gap:14,animation:"up 0.3s ease"}}>
                <div style={{width:340,background:SURF,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}>
                  <div style={{fontSize:9,color:"rgba(0,255,136,0.4)",letterSpacing:2,marginBottom:12,fontFamily:FONT}}>EYECODE.EXE // EXTRACTION IN PROGRESS</div>
                  {STEPS.map((s,i)=>(
                    <div key={i} style={{fontSize:11,marginBottom:4,color:i===step?G:i<step?"rgba(0,255,136,0.28)":"rgba(0,0,0,0)",display:"flex",alignItems:"center",gap:8,fontFamily:FONT}}>
                      <span style={{color:i<step?G:DIM}}>{i<step?"✓":i===step?"▶":"·"}</span>
                      {i<=step&&s}
                      {i===step&&<span style={{animation:"blink 0.8s step-end infinite"}}>_</span>}
                    </div>
                  ))}
                </div>
                <div style={{width:340,height:3,background:"rgba(0,255,136,0.08)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(step/(STEPS.length-1))*100}%`,background:`linear-gradient(90deg,${G},${C})`,borderRadius:2,transition:"width 0.7s ease"}} />
                </div>
              </div>
            )}

            {err&&!loading&&(
              <div style={{background:"rgba(255,51,102,0.05)",border:"1px solid rgba(255,51,102,0.2)",borderRadius:8,padding:16,animation:"up 0.3s ease"}}>
                <div style={{color:R,fontSize:9,letterSpacing:2,marginBottom:8,fontFamily:FONT}}>// EXTRACTION FAILED</div>
                <pre style={{fontSize:11,color:"#ff8899",whiteSpace:"pre-wrap",wordBreak:"break-all",fontFamily:FONT}}>{err}</pre>
              </div>
            )}

            {result&&!loading&&(
              <div style={{display:"flex",flexDirection:"column",gap:12,animation:"up 0.35s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:10,color:"rgba(0,255,136,0.4)",letterSpacing:1,fontFamily:FONT}}>✓ COMPLETE · <span style={{color:G}}>{result.title||url}</span></span>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <Btn onClick={()=>cp("j",json)} active={copied.j}>{copied.j?"✓ COPIED":"⊕ COPY JSON"}</Btn>
                    <Btn onClick={()=>dl("extraction.json",json,"application/json")}>↓ JSON</Btn>
                    {result.approximateHTML&&<><Btn onClick={()=>cp("h",result.approximateHTML)} active={copied.h}>{copied.h?"✓ COPIED":"⊕ COPY HTML"}</Btn><Btn onClick={()=>dl("extracted.html",result.approximateHTML,"text/html")}>↓ HTML</Btn></>}
                  </div>
                </div>

                <div style={{display:"flex",gap:2,background:"rgba(0,0,0,0.35)",borderRadius:7,padding:3,border:`1px solid ${BORDER}`,width:"fit-content"}}>
                  {["overview","colors","components","html","raw"].map(t=>(
                    <button key={t} onClick={()=>setTab(t)} style={{padding:"4px 13px",borderRadius:5,border:"none",fontFamily:FONT,fontSize:9,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",transition:"all 0.12s",background:tab===t?"rgba(0,255,136,0.12)":"transparent",color:tab===t?G:DIM,borderBottom:tab===t?`2px solid ${G}`:"2px solid transparent"}}>{t}</button>
                  ))}
                </div>

                {tab==="overview"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <Card title="// SITE INFO"><Row label="Title" value={result.title}/><Row label="Description" value={result.description}/><Row label="Layout" value={result.layout?.type}/><Row label="Max Width" value={result.layout?.maxWidth}/></Card>
                  <Card title="// TYPOGRAPHY"><Row label="Heading Font" value={result.typography?.headingFont}/><Row label="Body Font" value={result.typography?.bodyFont}/><Row label="Weight" value={result.typography?.headingWeight}/><Row label="Base Size" value={result.typography?.baseSize}/><Row label="Line Height" value={result.typography?.lineHeight}/></Card>
                  <Card title="// LAYOUT FLAGS">{Object.entries(result.layout||{}).filter(([k])=>!["type","maxWidth"].includes(k)).map(([k,v])=><Row key={k} label={k} value={String(v)}/>)}</Card>
                  <Card title="// TECH STACK"><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{(result.techStack||[]).map(t=><Pill key={t} text={t} cyan/>)}</div><div style={{fontSize:8,color:"rgba(0,255,136,0.3)",letterSpacing:1.5,marginBottom:5,fontFamily:FONT}}>SEO</div>{Object.entries(result.seo||{}).map(([k,v])=><Row key={k} label={k} value={String(v)}/>)}</Card>
                  <Card title="// ACCESSIBILITY"><Row label="Score" value={result.accessibility?.score}/><Row label="Notes" value={result.accessibility?.notes}/></Card>
                  <Card title="// PERFORMANCE">{Object.entries(result.performance||{}).map(([k,v])=><Row key={k} label={k} value={String(v)}/>)}</Card>
                </div>}

                {tab==="colors"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Card title="// COLOR ROLES" action={<Btn onClick={()=>cp("csv",makeCSSVars(result.colors))} active={copied.csv}>{copied.csv?"✓ COPIED":"⊕ CSS VARS"}</Btn>}>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{Object.entries(result.colors||{}).filter(([k])=>k!=="palette").map(([k,v])=>v&&<Swatch key={k} hex={v} label={k} onCopy={h=>cp("sw"+k,h)}/>)}</div>
                  </Card>
                  {(result.colors?.palette||[]).length>0&&<Card title="// FULL PALETTE"><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{result.colors.palette.map((c,i)=><Swatch key={i} hex={c} onCopy={h=>cp("p"+i,h)}/>)}</div></Card>}
                  <Card title="// CSS VARIABLES" action={<Btn onClick={()=>dl("colors.css",makeCSSVars(result.colors),"text/css")}>↓ CSS</Btn>}>
                    <pre style={{background:"rgba(0,0,0,0.4)",padding:14,borderRadius:6,fontSize:11,color:"#8adfb4",overflowX:"auto",border:`1px solid ${BORDER}`,fontFamily:FONT,lineHeight:1.6}}>{makeCSSVars(result.colors)}</pre>
                  </Card>
                </div>}

                {tab==="components"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <Card title="// UI COMPONENTS"><div style={{display:"flex",flexDirection:"column",gap:5}}>{(result.components||[]).map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(0,255,136,0.04)",borderRadius:5,border:`1px solid rgba(0,255,136,0.1)`}}><div style={{width:5,height:5,borderRadius:"50%",background:G,flexShrink:0}}/><span style={{fontSize:11,fontFamily:FONT}}>{c}</span></div>)}</div></Card>
                  <Card title="// UX PATTERNS"><div style={{display:"flex",flexDirection:"column",gap:5}}>{(result.uxPatterns||[]).map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(0,212,255,0.04)",borderRadius:5,border:"1px solid rgba(0,212,255,0.12)"}}><div style={{width:5,height:5,borderRadius:"50%",background:C,flexShrink:0}}/><span style={{fontSize:11,color:"#a0e8f8",fontFamily:FONT}}>{p}</span></div>)}</div></Card>
                </div>}

                {tab==="html"&&<Card title="// RECONSTRUCTED HTML" action={<div style={{display:"flex",gap:5}}><Btn onClick={()=>cp("rh",result.approximateHTML)} active={copied.rh}>{copied.rh?"✓ COPIED":"⊕ COPY"}</Btn><Btn onClick={()=>dl("extracted.html",result.approximateHTML,"text/html")}>↓ HTML</Btn><Btn onClick={()=>{setCode(result.approximateHTML);setMode("preview");setLive(false);}}>👁 PREVIEW →</Btn></div>}>
                  <pre style={{background:"rgba(0,0,0,0.4)",padding:14,borderRadius:6,fontSize:11,color:"#8adfb4",overflowX:"auto",maxHeight:400,overflowY:"auto",border:`1px solid ${BORDER}`,fontFamily:FONT,lineHeight:1.6}}>{result.approximateHTML||"// No HTML extracted"}</pre>
                </Card>}

                {tab==="raw"&&<Card title="// RAW JSON" action={<div style={{display:"flex",gap:5}}><Btn onClick={()=>cp("rj",json)} active={copied.rj}>{copied.rj?"✓ COPIED":"⊕ COPY"}</Btn><Btn onClick={()=>dl("extraction.json",json,"application/json")}>↓ JSON</Btn></div>}>
                  <pre style={{background:"rgba(0,0,0,0.4)",padding:14,borderRadius:6,fontSize:11,color:"#8adfb4",overflowX:"auto",maxHeight:500,overflowY:"auto",border:`1px solid ${BORDER}`,fontFamily:FONT,lineHeight:1.6}}>{json}</pre>
                </Card>}
              </div>
            )}

            {!loading&&!result&&!err&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,gap:12,color:"rgba(0,255,136,0.14)",userSelect:"none"}}>
                <div style={{fontSize:58}}>⊳</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,letterSpacing:5}}>AWAITING TARGET</div>
                <div style={{fontSize:9,letterSpacing:3,fontFamily:FONT}}>ENTER A URL ABOVE AND PRESS SCAN</div>
                <div style={{marginTop:10,display:"flex",gap:16,fontSize:9,color:"rgba(0,255,136,0.08)",letterSpacing:1,fontFamily:FONT}}>
                  {["HTML","COLORS","TYPOGRAPHY","COMPONENTS","UX PATTERNS","TECH STACK"].map(t=><span key={t}>· {t}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW MODE */}
      {mode==="preview"&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div style={{width:380,flexShrink:0,display:"flex",flexDirection:"column",borderRight:`1px solid ${BORDER}`,background:"rgba(0,0,0,0.2)"}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${BORDER}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:9,color:"rgba(0,255,136,0.38)",letterSpacing:2,fontFamily:FONT}}>// INPUT CODE</span>
              <div style={{display:"flex",gap:5}}>
                <label style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${BORDER}`,background:SURF,color:DIM,fontFamily:FONT,fontSize:10,letterSpacing:1,cursor:"pointer"}}>↑ UPLOAD<input type="file" accept=".html,.htm,.css,.js,.svg" onChange={e=>upload(e,"preview")} style={{display:"none"}} /></label>
                <Btn onClick={()=>cp("ic",code)} active={copied.ic}>{copied.ic?"✓":"⊕ COPY"}</Btn>
                <Btn danger onClick={()=>{setCode("");setLive(false);}}>✕</Btn>
              </div>
            </div>
            <textarea value={code} onChange={e=>{setCode(e.target.value);setLive(false);}} spellCheck={false} placeholder={"// Paste HTML, CSS, SVG or full page code\n// Then click ▶ RENDER PREVIEW"} style={{flex:1,background:"transparent",border:"none",resize:"none",outline:"none",color:"#8adfb4",fontFamily:FONT,fontSize:11.5,padding:14,lineHeight:1.65}} />
            <div style={{padding:"9px 12px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setLive(true)} style={{flex:1,padding:"9px 0",borderRadius:7,fontFamily:FONT,fontSize:11,fontWeight:700,letterSpacing:2,cursor:"pointer",transition:"all 0.15s",border:`1px solid ${G}`,background:"rgba(0,255,136,0.1)",color:G,boxShadow:"0 0 12px rgba(0,255,136,0.15)"}}>▶ RENDER PREVIEW</button>
              <Btn onClick={()=>cp("oc",code)} active={copied.oc}>{copied.oc?"✓":"⊕"}</Btn>
              <Btn onClick={()=>dl("preview.html",code,"text/html")}>↓</Btn>
            </div>
          </div>

          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"8px 14px",borderBottom:`1px solid ${BORDER}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:9,color:"rgba(0,255,136,0.38)",letterSpacing:2,fontFamily:FONT}}>// LIVE PREVIEW</span>
                {live&&<span style={{fontSize:9,color:G,display:"flex",alignItems:"center",gap:5,fontFamily:FONT}}><span style={{width:6,height:6,borderRadius:"50%",background:G,display:"inline-block",animation:"pg 1.5s infinite"}} />RENDERING</span>}
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                {[{id:"desktop",icon:"🖥"},{id:"tablet",icon:"📱"},{id:"mobile",icon:"📲"}].map(d=><Btn key={d.id} onClick={()=>setDevice(d.id)} active={device===d.id}>{d.icon}</Btn>)}
                <div style={{width:1,height:18,background:BORDER,margin:"0 4px"}} />
                <Btn onClick={()=>cp("po",code)} active={copied.po}>{copied.po?"✓ COPIED":"⊕ COPY"}</Btn>
                <Btn onClick={()=>dl("preview.html",code,"text/html")}>↓ HTML</Btn>
              </div>
            </div>
            <div style={{flex:1,overflow:"auto",background:"#111",display:"flex",alignItems:device!=="desktop"?"flex-start":"stretch",justifyContent:"center",padding:device!=="desktop"?20:0}}>
              {live?(
                <iframe key={code} srcDoc={code} sandbox="allow-scripts allow-same-origin allow-forms" style={{border:device!=="desktop"?`1px solid ${BORDER}`:"none",borderRadius:device!=="desktop"?12:0,background:"#fff",width:device==="desktop"?"100%":DW[device],height:device==="desktop"?"100%":600,flexShrink:0,boxShadow:device!=="desktop"?"0 8px 40px rgba(0,0,0,0.7)":"none"}} title="preview" />
              ):(
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"rgba(0,255,136,0.14)",gap:12,userSelect:"none"}}>
                  <div style={{fontSize:62}}>👁</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,letterSpacing:4}}>PREVIEW STANDBY</div>
                  <div style={{fontSize:9,letterSpacing:2,fontFamily:FONT}}>PASTE CODE → CLICK RENDER PREVIEW</div>
                  <div style={{marginTop:10,display:"flex",gap:16,fontSize:9,color:"rgba(0,255,136,0.08)",letterSpacing:1,fontFamily:FONT}}>{["HTML","CSS","JavaScript","SVG"].map(t=><span key={t}>· {t}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
