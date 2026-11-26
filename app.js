(async function(){
const D=DATA,$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const eg=n=>Number(n).toLocaleString("en-US");
const S=await API.getSettings();
let designs=[],cur=null,st={};
$("shA").textContent=eg(S.ship_default)+" ج";$("shB").textContent=eg(S.ship_far)+" ج";
$("wa").href=$("waf").href=`https://wa.me/${S.whatsapp}?text=${encodeURIComponent("أهلا، عايز أسأل عن هودي زونيكس")}`;
function hoodie(hex){const dk="rgba(0,0,0,.28)",lt="rgba(255,255,255,.10)";
return `<svg viewBox="0 0 400 380"><g stroke="#000" stroke-opacity=".35" stroke-width="2"><path d="M135 48 L92 66 L18 215 L66 240 L108 168 L108 345 Q200 362 292 345 L292 168 L334 240 L382 215 L308 66 L265 48 Q200 92 135 48Z" fill="${hex}"/><path d="M135 48 Q200 92 265 48 Q250 22 200 20 Q150 22 135 48Z" fill="${hex}"/><path d="M150 52 Q200 98 250 52 Q200 66 150 52Z" fill="${dk}"/><path d="M146 300 Q200 316 254 300 L262 338 Q200 350 138 338Z" fill="${lt}"/><path d="M108 168 L66 240 L108 255Z" fill="${dk}"/><path d="M292 168 L334 240 L292 255Z" fill="${dk}"/><path d="M18 215 L66 240 L58 262 L10 238Z" fill="${lt}"/><path d="M382 215 L334 240 L342 262 L390 238Z" fill="${lt}"/></g><line x1="188" y1="82" x2="186" y2="132" stroke="#ddd" stroke-width="3"/><line x1="212" y1="82" x2="214" y2="132" stroke="#ddd" stroke-width="3"/></svg>`}
function preview(){const c=D.colors.find(x=>x.id===st.color);
 $("stage").innerHTML=hoodie(c.hex)+`<div class="ov"><img src="${esc(cur.image_url)}" style="border-radius:6px"></div>`}
async function load(){
 try{designs=await API.getDesigns()}catch(e){designs=[]}
 $("gal").innerHTML=designs.length?"":`<div class="empty">التصاميم هتظهر هنا قريبا</div>`;
 designs.forEach(d=>{const b=document.createElement("button");b.className="dc";b.innerHTML=`<div class="im"><img loading="lazy" src="${esc(d.image_url)}" alt="${esc(d.name)}"></div><div class="in"><b>${esc(d.name)}</b><span>${eg(d.price||S.price)} ج</span></div><span class="go" style="color:#111">اطلب الآن</span>`;b.onclick=()=>open(d);$("gal").appendChild(b)});
}
function price(){return cur.price||S.price}
function mk(el,items,key,render){el.innerHTML="";items.forEach(it=>{const b=document.createElement("button");b.type="button";render(b,it);b.onclick=()=>{st[key]=it.id||it;[...el.children].forEach(x=>x.classList.remove("on"));b.classList.add("on");if(el.id==="colors")$("cn").textContent=it.name;if(key==="color")preview();calc()};if((it.id||it)===st[key])b.classList.add("on");el.appendChild(b)})}
function ship(){const g=$("gov").value;return g?(D.far.includes(g)?S.ship_far:S.ship_default):null}
function calc(){const sh=ship(),sub=price()*st.qty,tot=sh==null?null:sub+sh,dep=tot==null?null:Math.ceil(tot/2);$("q").textContent=st.qty;
 $("sum").innerHTML=`<div><span>${esc(cur.name)} × ${st.qty}</span><span>${eg(sub)} ج</span></div><div><span>الشحن</span><span>${sh==null?"اختار المحافظة":eg(sh)+" ج"}</span></div><div class="tot"><span>الإجمالي</span><span>${tot==null?"-":eg(tot)+" ج"}</span></div><div class="dep"><span style="color:var(--y)">العربون المطلوب (50%)</span><span>${dep==null?"-":eg(dep)+" ج"}</span></div><div><span>الباقي عند الاستلام</span><span>${tot==null?"-":eg(tot-dep)+" ج"}</span></div>`;return{sh,sub,tot,dep}}
function setStep(n){[1,2,3].forEach(i=>{const a=$("s"+i);a.classList.toggle("open",i===n);a.classList.toggle("done",i<n)});
 $("s1").querySelector("em").textContent=n>1?`${D.colors.find(c=>c.id===st.color).name} · ${st.size} · ×${st.qty}`:"";
 $("s2").querySelector("em").textContent=n>2?$("name").value:"";$("s"+n).scrollIntoView({behavior:"smooth",block:"nearest"})}
function open(d){cur=d;st={color:"black",shape:"oversize",size:"",qty:1,pos:"chest",proof:null};
 $("pname").textContent=d.name;$("pprice").textContent=eg(price())+" ج";
 mk($("colors"),D.colors,"color",(b,c)=>{b.style.background=c.hex;b.title=c.name});$("cn").textContent="أسود";
 mk($("shapes"),D.shapes,"shape",(b,s)=>b.innerHTML=`${s.name}<small>${s.desc}</small>`);mk($("sizes"),D.sizes,"size",(b,s)=>b.textContent=s);mk($("pos"),D.positions,"pos",(b,p)=>b.textContent=p.name);
 ["name","phone","phone2","addr","notes"].forEach(i=>$(i).value="");$("gov").value="";$("proof").value="";$("pz").classList.remove("has");$("pzt").textContent="ارفع صورة (سكرين شوت) التحويل";
 ["e1","e2","e3"].forEach(i=>$(i).textContent="");$("flow").hidden=false;$("ok").hidden=true;
 $("wal").textContent=S.wallet;$("walN").textContent=S.walletName||"";preview();calc();setStep(1);$("modal").hidden=false;document.body.style.overflow="hidden";$("modal").querySelector(".sheet").scrollTop=0}
function close(){$("modal").hidden=true;document.body.style.overflow=""}
$("mx").onclick=close;$("close2").onclick=close;$("modal").onclick=e=>{if(e.target.id==="modal")close()};
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
D.govs.forEach(g=>{const o=document.createElement("option");o.value=g;o.textContent=g;$("gov").appendChild(o)});
$("gov").onchange=calc;$("mn").onclick=()=>{st.qty=Math.max(1,st.qty-1);calc()};$("pl").onclick=()=>{st.qty=Math.min(20,st.qty+1);calc()};
$("cp").onclick=async()=>{try{await navigator.clipboard.writeText(S.wallet);$("cp").textContent="تم النسخ ✔"}catch(e){$("cp").textContent="انسخ الرقم يدويا"}setTimeout(()=>$("cp").textContent="نسخ الرقم",2000)};
$("proof").onchange=()=>{const f=$("proof").files[0];st.proof=f;$("pz").classList.toggle("has",!!f);$("pzt").textContent=f?"✔ "+f.name:"ارفع صورة (سكرين شوت) التحويل"};
const ar=s=>s.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
const bad=(e,id,msg)=>{$(e).textContent=msg;const x=$(id);x.classList.add("invalid");x.scrollIntoView({behavior:"smooth",block:"center"});return false};
function v1(){$("e1").textContent="";return st.size?true:bad("e1","sizes","اختار المقاس")}
function v2(){document.querySelectorAll(".invalid").forEach(x=>x.classList.remove("invalid"));$("e2").textContent="";const p=ar($("phone").value.trim()),p2=ar($("phone2").value.trim()),re=/^01[0125][0-9]{8}$/;
 if(!$("name").value.trim())return bad("e2","name","اكتب اسمك");if(!re.test(p))return bad("e2","phone","رقم الموبايل لازم يبقى 11 رقم ويبدأ بـ 01");if(p2&&!re.test(p2))return bad("e2","phone2","الرقم التاني غير صحيح");
 if(!$("gov").value)return bad("e2","gov","اختار المحافظة");if($("addr").value.trim().length<8)return bad("e2","addr","اكتب العنوان بالتفصيل");return true}
document.querySelectorAll("[data-next]").forEach(b=>b.onclick=()=>{const n=+b.dataset.next;if(n===2&&!v1())return;if(n===3&&!v2())return;setStep(n)});
[1,2,3].forEach(i=>$("s"+i).querySelector(".ah").onclick=()=>{if($("s"+i).classList.contains("done"))setStep(i)});
$("go").onclick=async()=>{$("e3").textContent="";if(!v1()||!v2())return;if(!st.proof)return bad("e3","pz","ارفع صورة تحويل العربون");
 const k=calc(),btn=$("go");btn.disabled=true;btn.textContent="جاري الإرسال...";
 try{const pu=await API.upload(st.proof,"proofs");
  const o={name:$("name").value.trim(),phone:ar($("phone").value.trim()),phone2:ar($("phone2").value.trim())||null,gov:$("gov").value,address:$("addr").value.trim(),color:st.color,shape:st.shape,size:st.size,qty:st.qty,position:st.pos,notes:$("notes").value.trim()||null,design_id:String(cur.id).length>20?cur.id:null,design_name:cur.name,design_url:cur.image_url,proof_url:pu,price:price(),shipping:k.sh,total:k.tot,deposit:k.dep};
  const code=await API.createOrder(o);
  $("flow").hidden=true;$("ok").hidden=false;$("code").textContent=code;
  $("okSum").innerHTML=`<div><span>التصميم</span><span>${esc(cur.name)}</span></div><div><span>اللون / المقاس</span><span>${D.colors.find(c=>c.id===st.color).name} / ${st.size} × ${st.qty}</span></div><div><span>الإجمالي</span><span>${eg(k.tot)} ج</span></div><div><span>العربون المدفوع</span><span>${eg(k.dep)} ج</span></div><div class="tot"><span>الباقي عند الاستلام</span><span>${eg(k.tot-k.dep)} ج</span></div>`;
  const msg=`أهلا زونيكس، أنا ${o.name}. أكد طلبي رقم ${code}: ${cur.name} - ${D.colors.find(c=>c.id===st.color).name} - مقاس ${st.size} × ${st.qty}. الإجمالي ${k.tot} ج والعربون ${k.dep} ج تم تحويله.`;
  $("wa2").href=`https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;$("modal").querySelector(".sheet").scrollTop=0;
 }catch(err){btn.disabled=false;btn.textContent="تأكيد الطلب";$("e3").textContent="حصلت مشكلة في الإرسال. جرب تاني أو كلمنا على واتساب."}};
$("tbtn").onclick=async()=>{const c=$("tcode").value.trim().toUpperCase();$("tres").textContent="...";const r=c?await API.track(c).catch(()=>null):null;
 $("tres").innerHTML=r?`حالة طلبك: <b style="color:var(--y)">${D.statuses.find(s=>s.id===r.status)?.name||r.status}</b>`:"مفيش طلب بالرقم ده";};
await load();
})();
