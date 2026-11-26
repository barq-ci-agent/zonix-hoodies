(function(){
const D=DATA,$=id=>document.getElementById(id);let all=[],flt="all",file=null;
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const nm=(a,id)=>(a.find(x=>x.id===id)||{name:id}).name;
const keys=["price","wallet","walletName","whatsapp","ship_default","ship_far"];
function tab(t){document.querySelectorAll(".tab button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));["orders","designs","settings"].forEach(x=>$("t_"+x).hidden=x!==t)}
document.querySelectorAll(".tab button").forEach(b=>b.onclick=()=>tab(b.dataset.t));
async function init(){
 if(!API.hasTok()){$("login").hidden=false;$("app").hidden=true;return}
 $("login").hidden=true;$("app").hidden=false;$("out").hidden=false;
 try{all=await API.listOrders()}catch(e){API.logout();return init()}
 const S=await API.getSettings();keys.forEach(k=>$("s_"+k).value=S[k]??"");window.S=S;
 render();designs();
}
function msgFor(o,st){const n=o.name,c=o.code;
 const m={deposit_ok:`أهلا ${n}، تم تأكيد استلام العربون لطلبك رقم ${c}. جاري تجهيز طلبك.`,prep:`أهلا ${n}، طلبك رقم ${c} تم تجهيزه وهيتشحن قريب.`,shipped:`أهلا ${n}، طلبك رقم ${c} اتشحن وهيوصلك قريب. المبلغ المتبقي عند الاستلام ${o.total-o.deposit} ج.`,done:`شكرا ${n}، تم تسليم طلبك رقم ${c}. نتمنى يعجبك!`,cancel:`أهلا ${n}، تم إلغاء طلبك رقم ${c}.`,new:`أهلا ${n}، وصلنا طلبك رقم ${c}.`};return m[st]}
const wa=(o,st)=>`https://wa.me/2${o.phone}?text=${encodeURIComponent(msgFor(o,st||o.status))}`;
function render(){
 const nn=all.filter(o=>o.status==="new").length;$("nb").hidden=!nn;$("nb").textContent=nn+" جديد";
 $("flt").innerHTML="";[{id:"all",name:"الكل ("+all.length+")"},...D.statuses.map(s=>({id:s.id,name:s.name+" ("+all.filter(o=>o.status===s.id).length+")"}))].forEach(s=>{const b=document.createElement("button");b.textContent=s.name;if(flt===s.id)b.className="on";b.onclick=()=>{flt=s.id;render()};$("flt").appendChild(b)});
 const l=all.filter(o=>flt==="all"||o.status===flt);$("list").innerHTML=l.length?"":'<div class="card" style="text-align:center;color:var(--m)">مفيش طلبات هنا لسه</div>';
 l.forEach(o=>{const st=D.statuses.find(s=>s.id===o.status)||D.statuses[0];const d=document.createElement("div");d.className="ord";
 d.innerHTML=`<div class="top"><b style="font-size:18px;direction:ltr">${esc(o.code)}</b><span class="pill" style="background:${st.c}">${st.name}</span></div>
 <div class="kv"><div><span>التصميم</span><br><b>${esc(o.design_name||"-")}</b></div><div><span>الاسم</span><br>${esc(o.name)}</div><div><span>الموبايل</span><br><a href="tel:${esc(o.phone)}" style="direction:ltr;display:inline-block">${esc(o.phone)}</a>${o.phone2?" / "+esc(o.phone2):""}</div><div><span>المحافظة</span><br>${esc(o.gov)}</div><div style="grid-column:1/-1"><span>العنوان</span><br>${esc(o.address)}</div>
 <div><span>اللون</span><br>${nm(D.colors,o.color)}</div><div><span>الشكل</span><br>${nm(D.shapes,o.shape)}</div><div><span>المقاس / الكمية</span><br>${esc(o.size)} × ${o.qty}</div><div><span>مكان الطباعة</span><br>${nm(D.positions,o.position)}</div>
 ${o.notes?`<div style="grid-column:1/-1"><span>ملاحظات</span><br>${esc(o.notes)}</div>`:""}
 <div><span>الإجمالي</span><br>${o.total} ج (شحن ${o.shipping})</div><div><span>العربون</span><br>${o.deposit} ج</div><div><span>الباقي عند الاستلام</span><br><b>${o.total-o.deposit} ج</b></div><div><span>التاريخ</span><br>${new Date(o.created_at).toLocaleString("ar-EG")}</div></div>
 <div>${o.design_url?`<a href="${esc(o.design_url)}" target="_blank"><img src="${esc(o.design_url)}" alt="التصميم"></a>`:""}${o.proof_url?`<a href="${esc(o.proof_url)}" target="_blank"><img src="${esc(o.proof_url)}" alt="التحويل"></a>`:""}</div>
 <div class="bar">${D.statuses.map(s=>`<button data-s="${s.id}" class="${s.id===o.status?"on":""}">${s.name}</button>`).join("")}<a class="btn ghost sm" target="_blank" href="${wa(o)}">رسالة واتساب للعميل (${st.name})</a></div>`;
 d.querySelectorAll("[data-s]").forEach(b=>b.onclick=async()=>{await API.setStatus(o.code,b.dataset.s);o.status=b.dataset.s;render()});$("list").appendChild(d)});
}
async function designs(){let l=[];try{l=await API.getDesigns(true)}catch(e){}
 $("dgrid").innerHTML=l.length?"":'<div class="empty">لسه مفيش تصاميم. ضيف أول تصميم من فوق.</div>';
 l.forEach(d=>{const c=document.createElement("div");c.className="card"+(d.active?"":" off");c.innerHTML=`<img src="${esc(d.image_url)}"><input value="${esc(d.name)}" data-f="name"><input type="number" value="${d.price??""}" placeholder="سعر خاص" data-f="price"><div class="bar"><button data-a="save">حفظ</button><button data-a="tog">${d.active?"إخفاء":"إظهار"}</button><button data-a="del">حذف</button></div>`;
 c.querySelector('[data-a=save]').onclick=async()=>{await API.saveDesign({id:d.id,name:c.querySelector('[data-f=name]').value.trim()||d.name,price:c.querySelector('[data-f=price]').value?Number(c.querySelector('[data-f=price]').value):null});designs()};
 c.querySelector('[data-a=tog]').onclick=async()=>{await API.saveDesign({id:d.id,active:!d.active});designs()};
 c.querySelector('[data-a=del]').onclick=async()=>{if(confirm("حذف التصميم نهائيا؟")){await API.deleteDesign(d.id);designs()}};$("dgrid").appendChild(c)})}
$("di").onchange=()=>{file=$("di").files[0];$("dz").classList.toggle("has",!!file);$("dzt").textContent=file?"✔ "+file.name:"اختار صورة التصميم (يفضل PNG)"};
$("da").onclick=async()=>{$("de").textContent="";const n=$("dn").value.trim();if(!n)return $("de").textContent="اكتب اسم التصميم";if(!file)return $("de").textContent="اختار صورة";
 $("da").disabled=true;try{const url=await API.upload(file,"designs");await API.saveDesign({name:n,price:$("dp").value?Number($("dp").value):null,image_url:url,active:true});$("dn").value="";$("dp").value="";$("di").value="";file=null;$("dz").classList.remove("has");$("dzt").textContent="اختار صورة التصميم (يفضل PNG)";designs()}catch(e){$("de").textContent="حصلت مشكلة في الرفع"}$("da").disabled=false};
$("lb").onclick=async()=>{$("le").textContent="";if(await API.login($("em").value.trim(),$("pw").value))init();else $("le").textContent="الإيميل أو الباسورد غلط"};
$("out").onclick=()=>{API.logout();location.reload()};
$("sv").onclick=async()=>{const s={};keys.forEach(k=>s[k]=$("s_"+k).value);await API.saveSettings(s);$("sm").textContent="اتحفظ ✔";setTimeout(()=>$("sm").textContent="",2000)};
setInterval(async()=>{if(!API.hasTok())return;try{const n=await API.listOrders();if(n.filter(o=>o.status==="new").length>all.filter(o=>o.status==="new").length){all=n;render();document.title="🔔 طلب جديد | زونيكس"}}catch(e){}},30000);
init();
})();
