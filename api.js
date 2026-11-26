(function(){
const C = window.CONFIG, live = !!C.SUPABASE_URL && !location.search.includes("demo");
const ls = (k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const uid = ()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
const tok = ()=>sessionStorage.getItem("zx_tok");
const H = (t)=>({apikey:C.SUPABASE_ANON_KEY, Authorization:"Bearer "+(t||C.SUPABASE_ANON_KEY)});
const R = p=>`${C.SUPABASE_URL}/rest/v1/${p}`;
const toDataURL = f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
const art=(bg,fg,t)=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='${bg}'/>${t}</svg>`);
const SEED=[
 {id:"d1",name:"قطة الليل",price:null,active:true,image_url:art("#111","#f5c518","<circle cx='200' cy='210' r='110' fill='#f5c518'/><polygon points='110,140 130,60 175,115' fill='#f5c518'/><polygon points='290,140 270,60 225,115' fill='#f5c518'/><circle cx='165' cy='200' r='16' fill='#111'/><circle cx='235' cy='200' r='16' fill='#111'/><path d='M170 250 Q200 280 230 250' stroke='#111' stroke-width='8' fill='none'/>")},
 {id:"d2",name:"ذئب هندسي",price:650,active:true,image_url:art("#1c2540","#fff","<polygon points='200,70 300,170 260,320 200,350 140,320 100,170' fill='#e9edf7'/><polygon points='200,70 240,170 200,230 160,170' fill='#7aa2ff'/><circle cx='170' cy='200' r='9' fill='#1c2540'/><circle cx='230' cy='200' r='9' fill='#1c2540'/>")},
 {id:"d3",name:"خط عربي: أصلي",price:null,active:true,image_url:art("#f2efe6","#111","<text x='200' y='230' font-size='120' text-anchor='middle' font-family='Cairo,Arial' font-weight='900' fill='#141414'>أصلي</text><rect x='90' y='260' width='220' height='10' fill='#f5c518'/>")},
 {id:"d4",name:"جمل الصحراء",price:null,active:true,image_url:art("#d98c4a","#fff","<circle cx='300' cy='110' r='42' fill='#ffe3a3'/><path d='M60 300 L120 300 L130 220 Q150 180 175 220 Q190 150 215 220 L240 300 L340 300 L340 330 L60 330Z' fill='#3b2a1a'/>")}
];
async function upload(file, prefix){
  if(!file) return null;
  if(!live) return await toDataURL(file);
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,5)||"jpg";
  const path = prefix+"/"+uid()+"."+ext;
  const r = await fetch(`${C.SUPABASE_URL}/storage/v1/object/${C.BUCKET}/${path}`,{method:"POST",headers:{...H(prefix==="proofs"?null:tok()),"Content-Type":file.type||"application/octet-stream"},body:file});
  if(!r.ok) throw new Error("upload");
  return `${C.SUPABASE_URL}/storage/v1/object/public/${C.BUCKET}/${path}`;
}
async function getSettings(){
  if(!live) return {...C.DEFAULTS, ...ls("zx_settings",{})};
  try{
    const rows = await (await fetch(R("zx_settings?select=key,value"),{headers:H()})).json(); const s={...C.DEFAULTS};
    rows.forEach(x=>{s[x.key]=(x.value===""||isNaN(x.value))?x.value:Number(x.value)}); return s;
  }catch(e){return {...C.DEFAULTS}}
}
async function getDesigns(all){
  if(!live){const d=ls("zx_designs",SEED);return all?d:d.filter(x=>x.active)}
  const r = await fetch(R("zx_designs?select=*&order=sort.desc,created_at.desc"+(all?"":"&active=eq.true")),{headers:H(all?tok():null)});
  if(!r.ok) throw new Error("designs"); return await r.json();
}
async function saveDesign(d){
  if(!live){let l=ls("zx_designs",SEED);if(d.id){l=l.map(x=>x.id===d.id?{...x,...d}:x)}else{l.unshift({...d,id:"d"+Date.now(),active:true})}localStorage.setItem("zx_designs",JSON.stringify(l));return}
  const body=JSON.stringify(d);
  if(d.id) await fetch(R("zx_designs?id=eq."+d.id),{method:"PATCH",headers:{...H(tok()),"Content-Type":"application/json"},body});
  else await fetch(R("zx_designs"),{method:"POST",headers:{...H(tok()),"Content-Type":"application/json",Prefer:"return=minimal"},body});
}
async function deleteDesign(id){
  if(!live){localStorage.setItem("zx_designs",JSON.stringify(ls("zx_designs",SEED).filter(x=>x.id!==id)));return}
  await fetch(R("zx_designs?id=eq."+id),{method:"DELETE",headers:H(tok())});
}
async function createOrder(o){
  const code = "ZX-"+Math.floor(100000+Math.random()*900000);
  o = {...o, code, status:"new", created_at:new Date().toISOString()};
  if(!live){ const l=ls("zx_orders",[]); l.unshift(o); localStorage.setItem("zx_orders",JSON.stringify(l)); return code; }
  const r = await fetch(R("zx_orders"),{method:"POST",headers:{...H(),"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(o)});
  if(!r.ok) throw new Error("order"); return code;
}
async function track(code){
  if(!live){const o=ls("zx_orders",[]).find(x=>x.code===code);return o?{status:o.status}:null}
  const r=await fetch(`${C.SUPABASE_URL}/rest/v1/rpc/zx_track`,{method:"POST",headers:{...H(),"Content-Type":"application/json"},body:JSON.stringify({p_code:code})});
  const j=await r.json(); return j&&j[0]?j[0]:null;
}
async function login(email,pw){
  if(!live){ if(pw==="demo"){sessionStorage.setItem("zx_tok","demo");return true} return false }
  const r = await fetch(`${C.SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:C.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password:pw})});
  if(!r.ok) return false; const j=await r.json(); sessionStorage.setItem("zx_tok",j.access_token); return true;
}
async function listOrders(){
  if(!live) return ls("zx_orders",[]);
  const r = await fetch(R("zx_orders?select=*&order=created_at.desc"),{headers:H(tok())});
  if(!r.ok) throw new Error("auth"); return await r.json();
}
async function setStatus(code,status){
  if(!live){const l=ls("zx_orders",[]);l.forEach(o=>{if(o.code===code)o.status=status});localStorage.setItem("zx_orders",JSON.stringify(l));return}
  await fetch(R("zx_orders?code=eq."+encodeURIComponent(code)),{method:"PATCH",headers:{...H(tok()),"Content-Type":"application/json"},body:JSON.stringify({status})});
}
async function saveSettings(s){
  if(!live){localStorage.setItem("zx_settings",JSON.stringify(s));return}
  await fetch(R("zx_settings?on_conflict=key"),{method:"POST",headers:{...H(tok()),"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(Object.entries(s).map(([key,value])=>({key,value:String(value)})))});
}
window.API={live,upload,getSettings,getDesigns,saveDesign,deleteDesign,createOrder,track,login,listOrders,setStatus,saveSettings,hasTok:()=>!!tok(),logout:()=>sessionStorage.removeItem("zx_tok")};
})();
