(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const K="caredirect_admin_v1",now=()=>Date.now(),mAgo=m=>now()-m*6e4,dAgo=d=>now()-d*864e5;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ini=n=>n.trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const pad=n=>String(n).padStart(2,"0"),money=n=>"$"+Math.round(n).toLocaleString();
const ago=t=>{const m=Math.round((now()-t)/6e4);return m<1?"Just now":m<60?m+"m ago":m<1440?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago"};
const clock=t=>new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const dayLbl=t=>{const d=Math.round((new Date().setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/864e5);return d<=0?"Today":d===1?"Yesterday":d+" Days Ago"};
const fmtSec=s=>s<60?s+"s":Math.floor(s/60)+"m "+pad(s%60)+"s";
const at=(h,m)=>new Date().setHours(h,m,0,0);
const uid=()=>Math.random().toString(36).slice(2,9);
const WINGS=["East Wing","West Wing","North Wing","Memory Care"],DIETS=["Standard","Low Sodium","Diabetic","Soft Foods"],CARES=["Independent","Intermediate","High Support"];

const seed=()=>{let n=940;const R=(name,wing,room,diet,care,d)=>({id:"RES-"+pad(++n).padStart(4,"0"),name,wing,room,diet,care,joined:dAgo(d)});
const S=(name,role,shift,hrs,phone,on)=>({id:uid(),name,role,shift,hrs,phone,on});
const B=(n,d)=>({n,d});
return{
res:[R("Eleanor Vance","East Wing","402","Low Sodium","Intermediate",40),R("Samuel Thompson","West Wing","105","Diabetic","High Support",200),R("Martha Jenkins","East Wing","312","Standard","Independent",90),R("Albert Ross","Memory Care","04","Soft Foods","High Support",300),R("Arthur Jenkins","East Wing","204","Standard","Intermediate",20),R("Robert Wilson","East Wing","206","Standard","Independent",250),R("Martha Stewart","West Wing","112","Diabetic","Intermediate",60),R("Arthur Morgan","East Wing","302-B","Standard","High Support",5),R("Clara Barton","West Wing","114-A","Low Sodium","Intermediate",12),R("David Lewis","North Wing","210","Soft Foods","Independent",400),R("Evelyn Reed","West Wing","120","Standard","Intermediate",150),R("Henry Walton","North Wing","215","Diabetic","High Support",33)],
rooms:[{id:uid(),label:"Room 204",num:"204",wing:"East Wing",tier:"Premium",beds:[B("Arthur Jenkins","Oct 12, 2023")]},{id:uid(),label:"Room 205",num:"205",wing:"East Wing",tier:"Standard",beds:[null]},{id:uid(),label:"Suite 112 (Shared)",num:"112",wing:"West Wing",tier:"Basic",beds:[B("Martha Stewart","Mar 03, 2024"),null]},{id:uid(),label:"Room 301",num:"301",wing:"North Wing",tier:"",beds:[null],maint:{task:"Deep Clean & Painting",eta:"Today, 5:00 PM"}},{id:uid(),label:"Room 206",num:"206",wing:"East Wing",tier:"Standard",beds:[B("Robert Wilson","Jan 05, 2024")]},{id:uid(),label:"Room 102",num:"102",wing:"West Wing",tier:"",beds:[null]}],
staff:[S("Sarah Johnson","Registered Nurse","Morning Shift","06:00 - 14:00","+1 555 0101",1),S("Marcus Chen","Facility Admin","Admin Day","09:00 - 17:00","+1 555 0102",1),S("Elena Rodriguez","Kitchen Lead","Split Shift","07:00 - 11:00 / 16:00 - 20:00","+1 555 0103",1),S("David Kim","Registered Nurse","Night Shift","22:00 - 06:00","+1 555 0104",0),S("Priya Nair","Caregiver","Evening Shift","14:00 - 22:00","+1 555 0105",1),S("Tom Becker","Night Watch","Night Shift","22:00 - 06:00","+1 555 0106",0)],
hol:[{id:uid(),name:"Sarah Johnson",dates:"Oct 28 – Oct 30",st:"pending"},{id:uid(),name:"Marcus Chen",dates:"Nov 2",st:"pending"},{id:uid(),name:"Elena Rodriguez",dates:"Nov 4 – Nov 6",st:"pending"}],
alerts:[{id:uid(),title:"Medication Missed: Clara Barton",sub:"Room 114-A • Blood Pressure Meds (10:00 AM)",t:mAgo(14)},{id:uid(),title:"Unauthorized Exit: North Gate",sub:"Staff ID #9284 • Door held open > 30s",t:mAgo(45)}],
em:[{id:uid(),res:"Arthur Morgan",loc:"Room 302-B",what:"Fall Detection Sensor Triggered",t:mAgo(2),st:"active"},{id:uid(),res:"Samuel Thompson",loc:"Room 105",what:"Low Glucose Alert",t:mAgo(9),st:"active"},
{id:uid(),res:"Evelyn Reed",loc:"Room 120",what:"Fall",t:at(8,14),resp:72,out:"Stabilized",st:"done"},{id:uid(),res:"Henry Walton",loc:"Room 215",what:"Chest pain",t:at(7,30),resp:45,out:"Treatment Given",st:"done"},{id:uid(),res:"Martha Stewart",loc:"Room 112",what:"Breathing difficulty",t:at(6,45),resp:182,out:"Hospitalized",st:"done"},{id:uid(),res:"James Wilson",loc:"Room 118",what:"Fall",t:at(4,12),resp:165,out:"Treatment Given",st:"done"}],
log:[{id:uid(),type:"Medication",icon:"💊",dot:"teal",title:"Morning Medication Administered",t:at(10,30),text:"Lisinopril (10mg) and Multivitamin taken with full glass of water. No adverse reaction noted.",by:"Nurse Jenna"},{id:uid(),type:"General",icon:"👥",dot:"mint",title:"Garden Social Participation",t:at(11,45),text:'Attended the "Herb Garden Walk." Highly engaged, conversing with three other residents. Mood: Elevated.',by:"Wellness Coach"},{id:uid(),type:"General",icon:"🍽",dot:"red",title:"Lunch Served",t:at(13,15),text:"Roasted Salmon with steamed asparagus and quinoa. Consumed 85% of the meal. Hydration: 300ml water.",by:""},{id:uid(),type:"Health",icon:"⇄",dot:"gray",title:"Afternoon Vitals Record",t:at(14,45),text:"",by:"",vit:{BP:"122/78",SPO2:"98%",TEMP:"98.4°F",STEP:"1,842"}}],
older:0,
audit:[{id:uid(),tag:"MEDICATION CHANGE",title:"Dosage updated for Resident #402",by:"Nurse R. Miller",t:at(10,42),tone:"teal"},{id:uid(),tag:"ACCESS LOG",title:"Secure Entry: South Wing Gate",by:"Maintenance Team B",t:at(9,15),tone:"teal"},{id:uid(),tag:"ALERT TRIGGER",title:"Fall Detection triggered in RM 12",by:"System",t:at(8,30),tone:"red"},{id:uid(),tag:"CARE PLAN",title:"Dietary restriction added: Low Sodium",by:"Dr. Sarah Jenkins",t:at(7,12),tone:"teal"}],
trend:{},
rev:[{id:uid(),res:"Arthur Morgan",fam:"Emily Morgan",stars:5,cat:"Staff",t:now(),st:"Needs Reply",text:"The night staff were incredibly kind and responsive when my father needed help.",reply:""},{id:uid(),res:"Clara Barton",fam:"John Barton",stars:4,cat:"Meals",t:dAgo(1),st:"Responded",text:"Meals are good, but more variety would be appreciated.",reply:"Thank you John, we are updating the menu next week."},{id:uid(),res:"David Lewis",fam:"Sarah Lewis",stars:3,cat:"Cleanliness",t:dAgo(2),st:"Pending",text:"The common room was not cleaned on Sunday.",reply:""},{id:uid(),res:"Eleanor Vance",fam:"Mark Vance",stars:5,cat:"Staff",t:dAgo(4),st:"Responded",text:"Nurse Jenna is wonderful with my mother.",reply:"We will pass this on, thank you!"},{id:uid(),res:"Albert Ross",fam:"Nina Ross",stars:5,cat:"Activities",t:dAgo(6),st:"Needs Reply",text:"The garden walks have made a big difference to his mood.",reply:""},{id:uid(),res:"Henry Walton",fam:"Paul Walton",stars:4,cat:"Meals",t:dAgo(8),st:"Responded",text:"Diabetic meals are well handled.",reply:"Glad to hear it."}],
camps:[{id:uid(),name:"Medical Support",goal:20000},{id:uid(),name:"Food Program",goal:15000},{id:uid(),name:"General Fund",goal:30000}],
don:[{id:uid(),donor:"Ahmed Rahman",type:"Bank Transfer",amt:500,camp:"Medical Support",t:now(),st:"Completed"},{id:uid(),donor:"Sarah Wilson",type:"Card",amt:1200,camp:"Food Program",t:dAgo(1),st:"Completed"},{id:uid(),donor:"Hasan Ali",type:"Cash",amt:200,camp:"General Fund",t:now(),st:"Pending"},{id:uid(),donor:"Rahman Foundation",type:"Bank Transfer",amt:40000,camp:"Medical Support",t:dAgo(60),st:"Completed"},{id:uid(),donor:"Linda Hayes",type:"Card",amt:750,camp:"Food Program",t:dAgo(12),st:"Completed"},{id:uid(),donor:"Omar Faruk",type:"Cash",amt:300,camp:"General Fund",t:dAgo(20),st:"Completed"}]}};
const OLD=[["Health","⇄","gray","Evening Blood Pressure Check","Yesterday 08:10 PM","BP 120/80, resting comfortably.","Nurse Jenna"],["Medication","💊","teal","Evening Medication","Yesterday 07:00 PM","Evening tablets taken with dinner.","Nurse Raj"],["General","👥","mint","Bingo Afternoon","Yesterday 03:30 PM","Joined the group bingo session and won a round.","Wellness Coach"],["Health","⇄","gray","Physiotherapy Session","2 days ago","30 min mobility exercises completed well.","Physio Team"],["General","🍽","red","Breakfast Served","2 days ago","Ate oatmeal and fruit. Hydration 250ml.",""],["Medication","💊","teal","Morning Medication","2 days ago","All medication taken, no issues.","Nurse Jenna"]];

let db;try{db=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!db||!db.res)db=seed();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}};
const log=(tag,title,by="Admin User",tone="teal")=>db.audit.unshift({id:uid(),tag,title,by,t:now(),tone});

/* ---------- UI helpers ---------- */
const css=document.createElement("style");
css.textContent=`[data-act]{cursor:pointer}.cd-ov{position:fixed;inset:0;background:rgba(10,30,28,.55);display:flex;align-items:center;justify-content:center;z-index:999;padding:16px}.cd-md{background:#fff;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}.cd-md.wide{max-width:680px}.cd-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.cd-hd h3{margin:0}.cd-hd button{border:0;background:none;font-size:18px;cursor:pointer}.cd-f{display:block;margin-bottom:12px}.cd-f span{display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#555}.cd-f input,.cd-f select,.cd-f textarea{width:100%;padding:10px;border:1px solid #d5dedc;border-radius:8px;font:inherit;box-sizing:border-box}.cd-ft{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.cd-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0e4b45;color:#fff;padding:12px 20px;border-radius:10px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,.25)}.ib{border:0;background:none;font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}.ib:hover{background:#e3f2ef}.cd-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #eef2f1}.cd-pgs button:disabled{opacity:.4}.cd-out{position:fixed;inset:0;background:#0e4b45;color:#fff;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}`;
document.head.appendChild(css);
let M=null,TT;
const close=()=>{M&&M.remove();M=null};
const toast=m=>{$(".cd-toast")?.remove();const t=document.createElement("div");t.className="cd-toast";t.textContent=m;document.body.appendChild(t);clearTimeout(TT);TT=setTimeout(()=>t.remove(),2600)};
const modal=(title,html,wide)=>{close();M=document.createElement("div");M.className="cd-ov";M.innerHTML=`<div class="cd-md${wide?" wide":""}"><div class="cd-hd"><h3>${title}</h3><button type="button" data-act="close">✕</button></div>${html}</div>`;document.body.appendChild(M);return M};
const form=(title,fields,label,cb,v={})=>{
const h=fields.map(([n,l,t,o])=>`<label class="cd-f"><span>${l}</span>${t==="select"?`<select name="${n}">${o.map(x=>`<option${String(x)===String(v[n])?" selected":""}>${esc(x)}</option>`).join("")}</select>`:t==="textarea"?`<textarea name="${n}" rows="3" ${o==="opt"?"":"required"}>${esc(v[n]||"")}</textarea>`:`<input name="${n}" type="${t}" value="${esc(v[n]??"")}" ${o==="opt"?"":"required"} ${t==="number"?'min="0" step="any"':""}>`}</label>`).join("");
const m=modal(title,`<form>${h}<div class="cd-ft"><button type="button" class="btn btn-ghost" data-act="close">Cancel</button><button class="btn btn-dark">${label}</button></div></form>`);
$("form",m).onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));Object.keys(d).forEach(k=>typeof d[k]==="string"&&(d[k]=d[k].trim()));if(cb(d)!==false)close()};
const f=$("input,select,textarea",m);f&&f.focus()};
const menu=(title,items)=>{const m=modal(title,items.map((x,i)=>`<button class="btn ${x[2]||"btn-light"} full" data-m="${i}" style="margin-bottom:8px">${x[0]}</button>`).join(""));$$("[data-m]",m).forEach(b=>b.onclick=()=>{const f=items[b.dataset.m][1];close();f()})};
const ask=(msg,fn,label="Confirm")=>{const m=modal("Please confirm",`<p>${msg}</p><div class="cd-ft"><button class="btn btn-ghost" data-act="close">Cancel</button><button class="btn btn-danger" id="cdy">${label}</button></div>`);$("#cdy",m).onclick=()=>{close();fn()}};
const csv=(name,rows)=>{const b=new Blob([rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n")],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();toast("Exported "+name)};
const setM=(p,label,val)=>{const c=$$(".metric-card,.stat-block",p).find(x=>$(".metric-label,.stat-label",x)?.textContent.trim().includes(label));if(!c)return;const v=$(".metric-value,.stat-value",c);if(v)v.textContent=val;return c};
const fill=(s,all,list,cur)=>{s.innerHTML=[all,...list].map(x=>`<option>${esc(x)}</option>`).join("");s.value=[all,...list].includes(cur)?cur:all};
const commit=m=>{save();render();m&&toast(m)};
const go=id=>{$$(".nav-link").forEach(l=>l.classList.toggle("active",l.dataset.page===id));$$(".page").forEach(p=>p.classList.toggle("active",p.id===id));$(".main-content").scrollTop=0;const s=$(".search-box input");s.value="";search()};
const search=()=>{const q=$(".search-box input").value.toLowerCase();$$(".page.active tbody tr,.page.active .room-card,.page.active .feed-item,.page.active .timeline-item,.page.active .audit-item").forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?"":"none")};

/* ---------- derived ---------- */
const occ=r=>r.beds.filter(Boolean).length,free=r=>r.maint?0:r.beds.length-occ(r);
const isNurse=s=>/nurse/i.test(s.role),isNight=s=>/night/i.test(s.shift+s.role);
const openEm=()=>db.em.filter(e=>e.st==="active");
const bedStats=()=>{const tot=db.rooms.reduce((a,r)=>a+r.beds.length,0),o=db.rooms.reduce((a,r)=>a+occ(r),0);return{tot,o,fr:db.rooms.reduce((a,r)=>a+free(r),0),mt:db.rooms.filter(r=>r.maint).length}};
const pct=(a,b)=>b?Math.round(a/b*100):0;

/* ---------- renderers ---------- */
let rf={q:"",w:"All Wings",d:"All Diets",p:1},sf={all:0},rm={q:"",w:"All Wings",s:"Status: All",v:"grid"},tab="All",rvAll=0,dnAll=0,range="Last 7 Days";
const dietPill={Standard:"pill-gray-outline","Low Sodium":"pill-teal-outline",Diabetic:"pill-red-outline","Soft Foods":"pill-red-outline"},careDot={Independent:"dot-mint",Intermediate:"dot-teal","High Support":"dot-red"},TONES=["teal","mint","brown"];

function rDash(){const p=$("#page-dashboard"),op=openEm(),bs=bedStats();
setM(p,"Active Residents",db.res.length);setM(p,"Staff on Duty",db.staff.filter(s=>s.on).length);setM(p,"Open Emergency",pad(op.length));
const items=[...op.map(e=>({k:"sos",id:e.id,title:"Emergency SOS: Resident "+e.res,sub:e.loc+" • "+e.what,t:e.t,d:e.disp})),...db.alerts.map(a=>({...a,k:"al"}))].sort((a,b)=>b.t-a.t);
$$(".feed-item,.cd-empty",p).forEach(x=>x.remove());
$(".feed-card",p).insertAdjacentHTML("beforeend",items.length?items.map(i=>{const s=i.k==="sos";return `<div class="feed-item ${s?"feed-critical":""}"><div class="feed-avatar ${s?"ring-red":"ring-teal"}"></div><div class="feed-body"><div class="feed-title-row"><span class="feed-title">${esc(i.title)}</span><span class="feed-time">${s?'<span class="dot-red"></span>':""}${ago(i.t)}</span></div><p class="feed-sub">${esc(i.sub)}</p><div class="feed-actions">${s?`<button class="btn btn-danger btn-sm" data-act="dispatch" data-id="${i.id}" ${i.d?"disabled":""}>${i.d?"Medical Dispatched ✓":"Dispatch Medical"}</button><button class="btn btn-ghost btn-sm" data-act="video" data-id="${i.id}">Check Video</button><button class="btn btn-ghost btn-sm" data-act="resolve" data-id="${i.id}">Resolve</button>`:`<button class="btn btn-ghost btn-sm" data-act="ack" data-id="${i.id}">Acknowledge</button>`}</div></div></div>`}).join(""):'<p class="muted-text cd-empty" style="padding:24px;text-align:center">No active alerts</p>');
const pc=pct(bs.o,bs.tot);$(".ring-value",p).textContent=pc+"%";const st=$$(".occupancy-row strong",p);st[0].textContent=db.rooms.filter(r=>occ(r)).length;st[1].textContent=db.rooms.filter(r=>free(r)).length;
const dot=$(".notif-dot");if(dot)dot.style.display=items.length?"":"none"}

function rActivity(){const p=$("#page-activity");$$(".tab",p).forEach(t=>{t.dataset.act="tab";t.dataset.v=t.textContent.trim();t.classList.toggle("active",t.dataset.v===tab)});
const L=db.log.filter(l=>tab==="All"||l.type===tab).sort((a,b)=>(typeof a.t==="string"?-1e15:a.t)-(typeof b.t==="string"?-1e15:b.t));
$(".timeline",p).innerHTML=L.length?L.map(l=>`<div class="timeline-item"><div class="timeline-dot ${l.dot}">${l.icon}</div><div class="timeline-content"><div class="timeline-top"><strong>${esc(l.title)}</strong><span>${typeof l.t==="string"?l.t:clock(l.t)}</span></div>${l.text?`<p>${esc(l.text)}</p>`:""}${l.vit?`<div class="vitals-grid">${Object.entries(l.vit).map(([k,v])=>`<div class="vital-box"><span>${k}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`:""}${l.by?`<span class="pill pill-teal">LOGGED BY: ${esc(l.by.toUpperCase())}</span>`:""}</div></div>`).join(""):'<p class="muted-text">No entries.</p>';
const b=$(".btn-outline-dashed",p);b.dataset.act="older";b.disabled=db.older>=OLD.length;b.textContent=b.disabled?"No Older Activities":"Load Older Activities";
const meds=db.log.filter(l=>l.type==="Medication").length;const ms=$$(".mini-value",p)[1];if(ms)ms.textContent="✓ "+(meds?100:0)+"%"}

function rRes(){const p=$("#page-residents"),s=$$("select",p);fill(s[0],"All Wings",WINGS,rf.w);fill(s[1],"All Diets",DIETS,rf.d);$("input",p).value=rf.q;
const mo=new Date().getMonth(),mm=r=>new Date(r.joined).getMonth()===mo&&new Date(r.joined).getFullYear()===new Date().getFullYear();
setM(p,"Total Residents",db.res.length);setM(p,"East Wing",db.res.filter(r=>r.wing==="East Wing").length);setM(p,"West Wing",db.res.filter(r=>r.wing==="West Wing").length);setM(p,"New This Month",db.res.filter(mm).length);
const q=rf.q.toLowerCase(),F=db.res.filter(r=>(rf.w==="All Wings"||r.wing===rf.w)&&(rf.d==="All Diets"||r.diet===rf.d)&&(!q||(r.name+r.room+r.id).toLowerCase().includes(q))),pages=Math.max(1,Math.ceil(F.length/10));rf.p=Math.min(rf.p,pages);
const sl=F.slice((rf.p-1)*10,rf.p*10);
$("tbody",p).innerHTML=sl.length?sl.map(r=>`<tr><td class="cell-person"><span class="avatar-circle initials teal">${ini(r.name)}</span><div><strong>${esc(r.name)}</strong><br><span class="muted-text">ID: #${r.id}</span></div></td><td>${esc(r.wing)}${r.room?", Room "+esc(r.room):""}</td><td><span class="pill ${dietPill[r.diet]}">${r.diet.toUpperCase()}</span></td><td><span class="${careDot[r.care]}"></span>${r.care}</td><td class="actions-cell"><button class="ib" data-act="editRes" data-id="${r.id}" title="Edit">✎</button><button class="ib" data-act="menuRes" data-id="${r.id}" title="More">⋮</button></td></tr>`).join(""):'<tr><td colspan="5" class="muted-text" style="text-align:center;padding:24px">No residents found</td></tr>';
$(".table-footer .muted-text",p).textContent=F.length?`Showing ${(rf.p-1)*10+1} to ${(rf.p-1)*10+sl.length} of ${F.length} residents`:"Showing 0 residents";
$(".pagination",p).className="pagination cd-pgs";$(".pagination",p).innerHTML=`<button data-act="rpage" data-v="prev" ${rf.p===1?"disabled":""}>‹</button>`+Array.from({length:pages},(_,i)=>`<button data-act="rpage" data-v="${i+1}" class="${i+1===rf.p?"active":""}">${i+1}</button>`).join("")+`<button data-act="rpage" data-v="next" ${rf.p===pages?"disabled":""}>›</button>`}

function rStaff(){const p=$("#page-staff"),S=db.staff,on=S.filter(s=>s.on),nu=S.filter(isNurse);
const c=setM(p,"Active Today",`${on.length} / ${S.length}`);$(".progress-fill",c).style.width=pct(on.length,S.length)+"%";
setM(p,"Nursing Staff",nu.length);setM(p,"Admin Team",S.filter(s=>/admin/i.test(s.role)).length).querySelector(".muted-text").textContent=S.filter(s=>/admin/i.test(s.role)&&s.on).length+" on duty";
const h=new Date().getHours(),nx=[6,14,22].find(x=>x>h)??30,mins=(nx-h)*60-new Date().getMinutes();const nc=setM(p,"Next Shift Rotation",pad(nx%24)+":00");nc.querySelector(".muted-text").textContent=mins+" minutes remaining";
const rows=sf.all?S:S.slice(0,5);
$("tbody",p).innerHTML=rows.map(s=>`<tr><td class="cell-person"><span class="avatar-circle initials teal">${ini(s.name)}</span><div><strong>${esc(s.name)}</strong><br><span class="role-tag ${/kitchen/i.test(s.role)?"red":"teal"}">${esc(s.role)}</span></div></td><td>${esc(s.shift)}<br><span class="muted-text">${esc(s.hrs)}</span> <span class="pill ${s.on?"pill-green":"pill-gray"}">${s.on?"On duty":"Off"}</span></td><td class="contact-icons"><span class="round-icon" data-act="call" data-id="${s.id}">📞</span><span class="round-icon" data-act="msg" data-id="${s.id}">💬</span></td><td><button class="ib" data-act="menuStaff" data-id="${s.id}">⋮</button></td></tr>`).join("");
const a=$(".center-link",p);a.dataset.act="staffAll";a.textContent=sf.all?"Show Less":`View All ${S.length} Staff Members`;
const g=[["Clinical Staff",S.filter(isNurse)],["Support Services",S.filter(s=>!isNurse(s)&&!isNight(s))],["Night Watch",S.filter(isNight)]];
$$(".coverage-row",p).forEach((r,i)=>{const v=pct(g[i][1].filter(s=>s.on).length,g[i][1].length);$("strong",r).textContent=v+"%";const f=r.nextElementSibling.querySelector(".progress-fill");f.style.width=v+"%";f.classList.toggle("danger",v<70);r.querySelector("span").className=v<70?"danger-text":""});
const ol=$(".link-action:not(.center-link)",$$(".card",p).find(x=>x.querySelector(".coverage-row")));if(ol)ol.dataset.act="optimize";
const hp=db.hol.filter(x=>x.st==="pending").length,hc=$(".management-card",p);hc.querySelector("p").textContent=hp?`There ${hp===1?"is 1 pending time-off request":"are "+hp+" pending time-off requests"} for the upcoming week that require approval.`:"No pending time-off requests.";$(".btn",hc).dataset.act="hol"}

function rRooms(){const p=$("#page-rooms"),bs=bedStats();setM(p,"Total Capacity",bs.tot+" Beds");setM(p,"Occupied",bs.o+" Beds");setM(p,"Available",bs.fr+" Units");setM(p,"Maintenance",bs.mt+" Units");
const s=$$("select",p);fill(s[0],"All Wings",WINGS,rm.w);fill(s[1],"Status: All",["Occupied","Available","Maintenance"],rm.s);const qi=$("input.grow",p);qi.value=rm.q;
$$(".toggle-btn",p).forEach((b,i)=>{b.dataset.act="view";b.dataset.v=i?"plan":"grid";b.classList.toggle("active",rm.v===b.dataset.v)});
const q=rm.q.toLowerCase(),F=db.rooms.filter(r=>(rm.w==="All Wings"||r.wing===rm.w)&&(!q||(r.label+r.wing+r.beds.map(b=>b?b.n:"").join(" ")).toLowerCase().includes(q))&&(rm.s==="Status: All"||(rm.s==="Maintenance"?r.maint:rm.s==="Occupied"?occ(r)>0:free(r)>0)));
const card=r=>{const o=occ(r),sh=r.beds.length>1,hd=pl=>`<div class="room-top"><div><span class="muted-text">${esc(r.label)}</span><h4>${esc(r.wing)} ${r.tier?`<span class="pill pill-green-soft">✓ ${r.tier}</span>`:""}</h4></div>${pl}</div>`,mn=`<button class="btn btn-square" data-act="menuRoom" data-id="${r.id}">⋮</button>`;
if(r.maint)return `<div class="room-card maintenance">${hd('<span class="pill pill-red-solid">Maintenance</span>')}<p class="muted-text light-red">${esc(r.maint.task)}<br><span class="dark-text">Expected Finish: ${esc(r.maint.eta)}</span></p><div class="room-actions"><button class="btn btn-outline-red grow" data-act="task" data-id="${r.id}">View Task</button>${mn}</div></div>`;
if(sh)return `<div class="room-card">${hd(`<span class="pill pill-teal-soft">${o}/${r.beds.length} Beds</span>`)}${r.beds.map((b,i)=>b?`<div class="bed-row"><strong>${esc(b.n)}</strong><span class="muted-text">Bed ${"ABCD"[i]}</span><span class="check-mark">✓</span></div>`:`<div class="bed-row dashed-row" data-act="assign" data-id="${r.id}" data-bed="${i}">+ Bed ${"ABCD"[i]} - Assign</div>`).join("")}<div class="room-actions"><button class="btn btn-outline-teal grow" data-act="roomInfo" data-id="${r.id}">Manage Suite</button>${mn}</div></div>`;
if(o)return `<div class="room-card">${hd('<span class="pill pill-teal-soft">Occupied</span>')}<p class="resident-name">${esc(r.beds[0].n)}<br><span class="muted-text">Admitted: ${esc(r.beds[0].d)}</span></p><div class="room-actions"><button class="btn btn-outline-teal grow" data-act="roomInfo" data-id="${r.id}">Details</button>${mn}</div></div>`;
return `<div class="room-card dashed">${hd('<span class="pill pill-teal-soft">Available</span>')}<p class="empty-slot">No resident assigned</p><div class="room-actions"><button class="btn btn-dark grow" data-act="assign" data-id="${r.id}" data-bed="0">+ Assign Resident</button>${mn}</div></div>`};
$(".room-grid",p).innerHTML=!F.length?'<p class="muted-text">No rooms match.</p>':rm.v==="plan"?WINGS.map(w=>{const x=F.filter(r=>r.wing===w);return x.length?`<h4 style="grid-column:1/-1;margin:8px 0 0">${w}</h4>`+x.map(card).join(""):""}).join(""):F.map(card).join("")}

function rEm(){const p=$("#page-emergency"),A=openEm(),D=db.em.filter(e=>e.st==="done"),avg=D.length?Math.round(D.reduce((a,e)=>a+e.resp,0)/D.length):0;
setM(p,"Active Emergencies",A.length).querySelector(".metric-value").innerHTML=A.length+' <span class="metric-tag">!</span>';
setM(p,"Resolved Today",D.filter(e=>new Date(e.t).toDateString()===new Date().toDateString()).length).querySelector(".metric-value").innerHTML=D.length+' <span class="metric-tag">✓</span>';
setM(p,"Avg Response",fmtSec(avg));setM(p,"Medical Team",db.staff.filter(s=>isNurse(s)&&s.on).length);
if(!$("[data-act=addEm]",p))$(".page-header",p).insertAdjacentHTML("beforeend",'<button class="btn btn-dark" data-act="addEm">+ Report Emergency</button>');
$("tbody",p).innerHTML=[...A,...D.sort((a,b)=>b.t-a.t)].map(e=>{const a=e.st==="active";return `<tr><td><strong>${esc(e.res)}</strong></td><td>${clock(e.t)}</td><td>${a?ago(e.t):fmtSec(e.resp)}</td><td><span class="pill ${a?"pill-red":e.out==="Hospitalized"?"pill-amber":"pill-green"}">${a?"In Progress":esc(e.out)}</span></td><td><span class="${a?"dot-red":"dot-green"}"></span>${a?"Active":"Resolved"}</td><td class="link-action">${a?`<span data-act="resolve" data-id="${e.id}">✓ Resolve</span> · `:""}<span data-act="emView" data-id="${e.id}">⌕ View</span></td></tr>`}).join("")||'<tr><td colspan="6" class="muted-text">No emergencies</td></tr>';
const l=$(".card-header .link-action",p);l.dataset.act="emLogs"}

function rReports(){const p=$("#page-reports"),bs=bedStats(),D=db.em.filter(e=>e.st==="done"),avg=D.length?D.reduce((a,e)=>a+e.resp,0)/D.length/60:0;
const sel=$("select",p);if(sel.options.length<3)sel.innerHTML=["Last 24 Hours","Last 7 Days","Last 30 Days"].map(x=>`<option>${x}</option>`).join("");sel.value=range;
if(!db.trend[range])db.trend[range]=Array.from({length:range==="Last 7 Days"?7:range==="Last 30 Days"?10:8},()=>25+Math.floor(Math.random()*70));
$(".bar-chart",p).innerHTML=db.trend[range].map(v=>`<div class="bar" style="height:${v}%" title="${v}"></div>`).join("");
$$(".audit-item",p).forEach(x=>x.remove());$(".audit-card .link-action",p).insertAdjacentHTML("beforebegin",db.audit.slice(0,4).map(a=>`<div class="audit-item ${a.tone}"><span class="audit-tag">${esc(a.tag)} <em>${clock(a.t)}</em></span><strong>${esc(a.title)}</strong><span class="muted-text">Modified by: ${esc(a.by)}</span></div>`).join(""));$(".audit-card .link-action",p).dataset.act="audit";
setM(p,"Avg. Response",avg.toFixed(1)+" min");const rc=setM(p,"Resolved Alerts",`${D.length} / ${db.em.length}`);$(".pill",rc).textContent=`✓ ${pct(D.length,db.em.length)}% Efficiency`;
setM(p,"Critical Alerts",pad(openEm().length));const oc=setM(p,"Facility Occupancy",pct(bs.o,bs.tot)+"%");$(".muted-text",oc).textContent=`${bs.o} / ${bs.tot} Beds Active`}

function rRev(){const p=$("#page-reviews"),R=[...db.rev].sort((a,b)=>b.t-a.t),n=R.length;
setM(p,"Overall Rating",(n?R.reduce((a,r)=>a+r.stars,0)/n:0).toFixed(1)+"/5.0");setM(p,"Total Reviews",n);setM(p,"Positive",pct(R.filter(r=>r.stars>=4).length,n)+"%");setM(p,"Pending Responses",R.filter(r=>r.st!=="Responded").length);
const rows=rvAll?R:R.slice(0,3),sp={"Needs Reply":'pill-red-soft">● Needs Reply',Responded:'pill-green-soft">✓ Responded',Pending:'pill-amber">⏱ Pending'};
$("tbody",p).innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.res)}</strong><br><span class="muted-text">Family: ${esc(r.fam)}</span></td><td><span class="stars">${"★".repeat(r.stars)+"☆".repeat(5-r.stars)}</span><br><span class="muted-text">${dayLbl(r.t)}</span></td><td><span class="pill pill-lavender">${esc(r.cat)}</span></td><td><span class="pill ${sp[r.st]}</span></td><td class="link-action" data-act="rv" data-id="${r.id}">View</td></tr>`).join("");
$(".card-header .muted-text",p).textContent=`Showing ${rows.length} ${rvAll?"":"latest "}entries`;const a=$(".center-link",p);a.dataset.act="rvAll";a.textContent=rvAll?"Show Latest 3":`View All ${n} Reviews`}

function rDon(){const p=$("#page-donation"),C=db.don.filter(d=>d.st==="Completed"),m=new Date().getMonth();
if(!$("[data-act=addDon]",p))$(".header-controls",p).insertAdjacentHTML("afterbegin",'<button class="btn btn-outline-teal" data-act="addDon">+ Add Donation</button>');
const hb=$$(".header-controls .btn",p);hb.find(b=>/Export/.test(b.textContent)).dataset.act="exportDon";hb.find(b=>/Campaign/.test(b.textContent)).dataset.act="addCamp";
setM(p,"Total Donations",money(C.reduce((a,d)=>a+d.amt,0)));setM(p,"This Month",money(C.filter(d=>new Date(d.t).getMonth()===m).reduce((a,d)=>a+d.amt,0)));setM(p,"Active Donors",new Set(db.don.map(d=>d.donor)).size);setM(p,"Campaigns",db.camps.length);
const L=[...db.don].sort((a,b)=>b.t-a.t),rows=dnAll?L:L.slice(0,5);
$("tbody",p).innerHTML=rows.map((d,i)=>`<tr><td class="cell-person"><span class="avatar-circle initials ${TONES[i%3]}">${ini(d.donor)}</span><strong>${esc(d.donor)}</strong></td><td>${d.type}</td><td>${money(d.amt)}</td><td>${esc(d.camp)}</td><td>${d.st==="Pending"?"Pending":dayLbl(d.t)==="Today"||dayLbl(d.t)==="Yesterday"?dayLbl(d.t):new Date(d.t).toLocaleDateString()}</td><td><span class="pill ${d.st==="Completed"?"pill-green":"pill-lavender"}">${d.st}</span></td><td><button class="ib" data-act="menuDon" data-id="${d.id}">⋮</button></td></tr>`).join("");
const a=$(".card-header .link-action",p);a.dataset.act="donAll";a.textContent=dnAll?"Show Recent":"View All Transactions"}

function render(){rDash();rActivity();rRes();rStaff();rRooms();rEm();rReports();rRev();rDon();search()}

/* ---------- forms & logic ---------- */
const byId=(a,id)=>a.find(x=>x.id===id);
const syncName=(o,n)=>db.rooms.forEach(r=>r.beds.forEach(b=>b&&b.n===o&&(b.n=n)));
function resForm(r){const e=!!r;form(e?"Edit Resident":"New Admission",[["name","Full name","text"],["wing","Wing / Ward","select",WINGS],["room","Room number","text","opt"],["diet","Dietary type","select",DIETS],["care","Care level","select",CARES]],e?"Save Changes":"Admit Resident",d=>{if(e){syncName(r.name,d.name);Object.assign(r,d);log("CARE PLAN","Resident record updated: "+d.name);commit("Resident updated")}else{const id="RES-"+String(Math.max(0,...db.res.map(x=>+x.id.slice(4)))+1).padStart(4,"0");db.res.unshift({id,...d,joined:now()});log("ADMISSION","New admission: "+d.name);commit("Resident admitted");}},r||{wing:"East Wing"})}
function staffForm(s){const e=!!s;form(e?"Edit Staff":"Add New Staff",[["name","Full name","text"],["role","Role (e.g. Registered Nurse)","text"],["shift","Shift name","text"],["hrs","Hours (e.g. 06:00 - 14:00)","text"],["phone","Phone","tel"]],e?"Save Changes":"Add Staff",d=>{if(e)Object.assign(s,d);else db.staff.push({id:uid(),...d,on:1});log("STAFF",(e?"Staff updated: ":"Staff added: ")+d.name);commit(e?"Staff updated":"Staff added")},s||{shift:"Morning Shift"})}
function assign(rid,bi,pre){const r=byId(db.rooms,rid);let i=+bi;if(r.beds[i])i=r.beds.findIndex(b=>!b);if(i<0)return toast("No free bed");
form("Assign Resident – "+r.label,[["name","Resident","select",db.res.map(x=>x.name)]],"Assign",d=>{db.rooms.forEach(x=>x.beds.forEach((b,k)=>b&&b.n===d.name&&(x.beds[k]=null)));r.beds[i]={n:d.name,d:new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})};const rs=db.res.find(x=>x.name===d.name);if(rs){rs.wing=r.wing;rs.room=r.num}log("ROOM ASSIGNMENT",`${d.name} assigned to ${r.label}`);commit("Resident assigned")},{name:pre})}
function roomForm(){form("Add Room",[["label","Room name (e.g. Room 210)","text"],["wing","Wing","select",WINGS],["tier","Tier","select",["Standard","Premium","Basic"]],["beds","Number of beds","number"]],"Add Room",d=>{const n=Math.min(4,Math.max(1,Math.round(+d.beds)));db.rooms.push({id:uid(),label:d.label,num:d.label.replace(/\D/g,"")||d.label,wing:d.wing,tier:d.tier,beds:Array(n).fill(null)});log("ROOM","Room added: "+d.label);commit("Room added")},{beds:1})}
function emForm(){form("Report Emergency",[["res","Resident","select",db.res.map(x=>x.name)],["loc","Location","text"],["what","What happened","text"]],"Raise Alert",d=>{db.em.unshift({id:uid(),...d,t:now(),st:"active"});log("ALERT TRIGGER","Emergency reported for "+d.res,"Admin User","red");commit("Emergency alert raised")})}
function resolveForm(e){form("Resolve – "+e.res,[["out","Outcome","select",["Stabilized","Treatment Given","Hospitalized"]]],"Mark Resolved",d=>{e.st="done";e.out=d.out;e.resp=Math.max(1,Math.round((now()-e.t)/1000));log("ALERT TRIGGER",`Emergency resolved for ${e.res} (${d.out})`);commit("Emergency resolved")})}
function reviewView(r){const m=modal("Review – "+esc(r.res),`<p class="muted-text">Family: ${esc(r.fam)} • ${esc(r.cat)} • ${dayLbl(r.t)}</p><p class="stars">${"★".repeat(r.stars)+"☆".repeat(5-r.stars)}</p><p>${esc(r.text)}</p><label class="cd-f"><span>Your reply</span><textarea id="rvt" rows="3">${esc(r.reply)}</textarea></label><div class="cd-ft"><button class="btn btn-ghost" id="rvp">Mark Pending</button><button class="btn btn-dark" id="rvs">Send Reply</button></div>`);
$("#rvs",m).onclick=()=>{const t=$("#rvt",m).value.trim();if(!t)return toast("Write a reply first");r.reply=t;r.st="Responded";log("FEEDBACK","Replied to review from "+r.fam);close();commit("Reply sent")};$("#rvp",m).onclick=()=>{r.st="Pending";close();commit("Marked as pending")}}
function donForm(){if(!db.camps.length)return toast("Create a campaign first");form("Add Donation",[["donor","Donor name","text"],["type","Type","select",["Bank Transfer","Card","Cash"]],["amt","Amount ($)","number"],["camp","Campaign","select",db.camps.map(c=>c.name)],["st","Status","select",["Completed","Pending"]]],"Save Donation",d=>{if(!(+d.amt>0))return false;db.don.push({id:uid(),...d,amt:+d.amt,t:now()});log("DONATION",`${money(+d.amt)} from ${d.donor}`);commit("Donation recorded")})}
const grp=()=>[["Clinical Staff",db.staff.filter(isNurse)],["Support Services",db.staff.filter(s=>!isNurse(s)&&!isNight(s))],["Night Watch",db.staff.filter(isNight)]];

const A={
close,go:d=>go(d.p),
tab:d=>{tab=d.v;rActivity()},
older:()=>{OLD.slice(db.older,db.older+2).forEach(o=>db.log.push({id:uid(),type:o[0],icon:o[1],dot:o[2],title:o[3],t:o[4],text:o[5],by:o[6]}));db.older=Math.min(OLD.length,db.older+2);db.log.sort((a,b)=>(typeof a.t==="string"?-1:0)-(typeof b.t==="string"?-1:0));commit("Older activities loaded")},
addLog:()=>form("Add Activity Entry",[["type","Category","select",["Medication","Health","General"]],["title","Title","text"],["text","Details","textarea"],["by","Logged by","text","opt"]],"Add Entry",d=>{db.log.push({id:uid(),...d,icon:{Medication:"💊",Health:"⇄",General:"👥"}[d.type],dot:{Medication:"teal",Health:"gray",General:"mint"}[d.type],t:now()});log("CARE LOG","Activity logged: "+d.title);commit("Entry added")}),
photo:(d,el)=>modal("Activity Photo",`<div class="photo-box large" style="min-height:220px">${esc(el.textContent.trim())}</div>`),
album:()=>modal("Photo Album",`<div class="photo-grid">${$$("#page-activity .photo-box").map(x=>`<div class="photo-box">${esc(x.textContent.trim())}</div>`).join("")}</div>`),
dispatch:d=>{const e=byId(db.em,d.id);e.disp=1;log("ALERT TRIGGER","Medical team dispatched to "+e.loc,"Admin User","red");commit("Medical team dispatched to "+e.loc)},
video:d=>{const e=byId(db.em,d.id);modal("Live Camera – "+esc(e.loc),`<div style="background:#111;color:#8f8;height:200px;border-radius:10px;display:flex;align-items:center;justify-content:center">● LIVE – ${esc(e.loc)}</div><p class="muted-text">${esc(e.what)} • ${ago(e.t)}</p>`)},
resolve:d=>resolveForm(byId(db.em,d.id)),
ack:d=>{db.alerts=db.alerts.filter(a=>a.id!==d.id);commit("Alert acknowledged")},
clearAlerts:()=>ask("Clear all non-emergency alerts? Open emergencies stay until resolved.",()=>{db.alerts=[];commit("Alerts cleared")},"Clear"),
addRes:()=>resForm(),editRes:d=>resForm(byId(db.res,d.id)),
menuRes:d=>{const r=byId(db.res,d.id);menu(esc(r.name),[["Edit record",()=>resForm(r)],["Delete resident",()=>ask(`Delete ${esc(r.name)}? This removes them from rooms too.`,()=>{db.rooms.forEach(x=>x.beds.forEach((b,i)=>b&&b.n===r.name&&(x.beds[i]=null)));db.res=db.res.filter(x=>x!==r);log("ADMISSION","Resident removed: "+r.name,"Admin User","red");commit("Resident deleted")},"Delete"),"btn-danger"]])},
rpage:d=>{rf.p=d.v==="prev"?rf.p-1:d.v==="next"?rf.p+1:+d.v;rRes()},
rclear:()=>{rf={q:"",w:"All Wings",d:"All Diets",p:1};rRes()},
addStaff:()=>staffForm(),
menuStaff:d=>{const s=byId(db.staff,d.id);menu(esc(s.name),[["Edit details",()=>staffForm(s)],[s.on?"Mark off duty":"Mark on duty",()=>{s.on=s.on?0:1;log("STAFF",`${s.name} ${s.on?"on":"off"} duty`);commit("Duty status updated")}],["Remove staff",()=>ask("Remove "+esc(s.name)+"?",()=>{db.staff=db.staff.filter(x=>x!==s);commit("Staff removed")},"Remove"),"btn-danger"]])},
call:d=>{const s=byId(db.staff,d.id);const m=modal("Calling…",`<p><strong>${esc(s.name)}</strong><br>${esc(s.phone)}</p><div class="cd-ft"><button class="btn btn-danger" data-act="close">End Call</button></div>`)},
msg:d=>{const s=byId(db.staff,d.id);form("Message "+s.name,[["m","Message","textarea"]],"Send",x=>{log("COMMUNICATION","Message sent to "+s.name);save();render();toast("Message sent to "+s.name)})},
staffAll:()=>{sf.all=sf.all?0:1;rStaff()},
optimize:()=>{const g=grp().map(([n,l])=>[n,l,pct(l.filter(s=>s.on).length,l.length)]).sort((a,b)=>a[2]-b[2])[0],off=g[1].filter(s=>!s.on);if(!off.length)return toast("Rosters are already fully covered");ask(`${g[0]} coverage is ${g[2]}%. Bring ${off.length} off-duty staff (${off.map(s=>esc(s.name)).join(", ")}) on duty?`,()=>{off.forEach(s=>s.on=1);log("STAFF","Roster optimized: "+g[0]);commit("Roster optimized")},"Apply")},
hol:()=>{const P=db.hol.filter(h=>h.st==="pending");if(!P.length)return toast("No pending requests");modal("Holiday Requests",P.map(h=>`<div class="cd-row"><div><strong>${esc(h.name)}</strong><br><span class="muted-text">${esc(h.dates)}</span></div><div><button class="btn btn-dark btn-sm" data-act="holSet" data-id="${h.id}" data-v="approved">Approve</button> <button class="btn btn-ghost btn-sm" data-act="holSet" data-id="${h.id}" data-v="rejected">Reject</button></div></div>`).join(""))},
holSet:d=>{const h=byId(db.hol,d.id);h.st=d.v;log("STAFF",`Time off ${d.v}: ${h.name}`);save();render();toast("Request "+d.v);db.hol.some(x=>x.st==="pending")?A.hol():close()},
view:d=>{rm.v=d.v;rRooms()},addRoom:roomForm,
assign:d=>assign(d.id,d.bed),
roomInfo:d=>{const r=byId(db.rooms,d.id);modal(esc(r.label),`<p>${esc(r.wing)} • ${r.tier||"No tier"} • ${r.beds.length} bed(s)</p>${r.beds.map((b,i)=>`<div class="cd-row"><span>Bed ${"ABCD"[i]}: <strong>${b?esc(b.n):"Free"}</strong>${b?` <span class="muted-text">since ${esc(b.d)}</span>`:""}</span>${b?`<button class="btn btn-ghost btn-sm" data-act="discharge" data-id="${r.id}" data-bed="${i}">Discharge</button>`:`<button class="btn btn-dark btn-sm" data-act="assign" data-id="${r.id}" data-bed="${i}">Assign</button>`}</div>`).join("")}`)},
discharge:d=>{const r=byId(db.rooms,d.id),b=r.beds[d.bed];ask(`Discharge ${esc(b.n)} from ${esc(r.label)}?`,()=>{const rs=db.res.find(x=>x.name===b.n);if(rs)rs.room="";r.beds[d.bed]=null;log("ROOM ASSIGNMENT",`${b.n} discharged from ${r.label}`);commit("Resident discharged")},"Discharge")},
task:d=>{const r=byId(db.rooms,d.id);ask(`<strong>${esc(r.maint.task)}</strong><br>Expected finish: ${esc(r.maint.eta)}<br>Mark this maintenance task as complete?`,()=>{r.maint=null;log("ROOM",r.label+" maintenance completed");commit("Room is available again")},"Mark Complete")},
menuRoom:d=>{const r=byId(db.rooms,d.id),it=[["View details",()=>A.roomInfo({id:r.id})]];if(free(r))it.push(["Assign resident",()=>assign(r.id,r.beds.findIndex(b=>!b))]);if(r.maint)it.push(["Complete maintenance",()=>A.task({id:r.id})]);else it.push(["Set under maintenance",()=>form("Maintenance – "+r.label,[["task","Task","text"],["eta","Expected finish","text"]],"Save",x=>{r.beds=r.beds.map(()=>null);r.maint=x;log("ROOM",r.label+" set to maintenance");commit("Maintenance scheduled")}),]);it.push(["Delete room",()=>occ(r)?toast("Discharge residents first"):ask("Delete "+esc(r.label)+"?",()=>{db.rooms=db.rooms.filter(x=>x!==r);commit("Room deleted")},"Delete"),"btn-danger"]);menu(esc(r.label),it)},
addEm,emView:d=>{const e=byId(db.em,d.id);modal("Incident – "+esc(e.res),`<p><strong>${esc(e.what)}</strong><br>${esc(e.loc)} • ${clock(e.t)}</p><p>Status: ${e.st==="active"?"Active":"Resolved – "+esc(e.out)}${e.resp?"<br>Response time: "+fmtSec(e.resp):""}</p>`)},
emLogs:()=>{modal("Emergency Logs",db.em.map(e=>`<div class="cd-row"><span><strong>${esc(e.res)}</strong> – ${esc(e.what)}<br><span class="muted-text">${new Date(e.t).toLocaleString()}</span></span><span>${e.st==="active"?"Active":esc(e.out)}</span></div>`).join("")+`<div class="cd-ft"><button class="btn btn-outline-teal" id="ex">Export CSV</button></div>`,1);$("#ex").onclick=()=>csv("emergency-log.csv",[["Resident","Location","Incident","Time","Status","Outcome","Response (s)"],...db.em.map(e=>[e.res,e.loc,e.what,new Date(e.t).toLocaleString(),e.st,e.out||"",e.resp||""])])},
audit:()=>{modal("Audit Trail",db.audit.map(a=>`<div class="cd-row"><span><strong>${esc(a.title)}</strong><br><span class="muted-text">${esc(a.tag)} • ${esc(a.by)}</span></span><span class="muted-text">${new Date(a.t).toLocaleString()}</span></div>`).join("")+`<div class="cd-ft"><button class="btn btn-outline-teal" id="ex">Export CSV</button></div>`,1);$("#ex").onclick=()=>csv("audit-trail.csv",[["Type","Event","User","Time"],...db.audit.map(a=>[a.tag,a.title,a.by,new Date(a.t).toLocaleString()])])},
rv:d=>reviewView(byId(db.rev,d.id)),rvAll:()=>{rvAll=rvAll?0:1;rRev()},
addDon:donForm,donAll:()=>{dnAll=dnAll?0:1;rDon()},
addCamp:()=>form("New Campaign",[["name","Campaign name","text"],["goal","Goal amount ($)","number"]],"Create",d=>{if(db.camps.some(c=>c.name.toLowerCase()===d.name.toLowerCase()))return toast("Campaign already exists")||false;db.camps.push({id:uid(),name:d.name,goal:+d.goal});log("DONATION","Campaign created: "+d.name);commit("Campaign created")}),
exportDon:()=>csv("donations.csv",[["Donor","Type","Amount","Campaign","Date","Status"],...db.don.map(d=>[d.donor,d.type,d.amt,d.camp,new Date(d.t).toLocaleDateString(),d.st])]),
menuDon:d=>{const x=byId(db.don,d.id);menu(esc(x.donor)+" – "+money(x.amt),[[x.st==="Pending"?"Mark completed":"Mark pending",()=>{x.st=x.st==="Pending"?"Completed":"Pending";commit("Donation updated")}],["Delete donation",()=>ask("Delete this donation record?",()=>{db.don=db.don.filter(y=>y!==x);commit("Donation deleted")},"Delete"),"btn-danger"]])},
logout:()=>ask("Do you want to log out of CareDirect?",()=>{const o=document.createElement("div");o.className="cd-out";o.innerHTML='<h2>You have been logged out</h2><button class="btn btn-light" id="in">Sign in again</button>';document.body.appendChild(o);$("#in").onclick=()=>o.remove()},"Log out"),
notif:()=>{const n=openEm().length+db.alerts.length;go("page-dashboard");toast(n?n+" active alert(s)":"No new notifications")}};
function addEm(){emForm()}

/* ---------- wiring ---------- */
const tag=(sel,act,extra)=>{const e=$(sel);if(e){e.dataset.act=act;if(extra)Object.assign(e.dataset,extra)}};
$$(".nav-link").forEach(l=>{l.dataset.act="go";l.dataset.p=l.dataset.page});
tag(".logout-link","logout");tag(".icon-btn","notif");
tag("#page-dashboard .feed-card .link-action","clearAlerts");
const mb=$$("#page-dashboard .management-card .btn");if(mb.length>2){mb[0].dataset.act="addRes";mb[1].dataset.act="go";mb[1].dataset.p="page-staff";mb[2].dataset.act="go";mb[2].dataset.p="page-residents"}
tag("#page-residents .stat-strip .btn","addRes");tag("#page-residents .clear-link","rclear");tag("#page-staff .page-header .btn","addStaff");
$("#page-rooms .page-header").insertAdjacentHTML("beforeend",'<button class="btn btn-dark" data-act="addRoom">+ Add Room</button>');
$("#page-activity .page-header").insertAdjacentHTML("beforeend",'<button class="btn btn-dark" data-act="addLog">+ Add Entry</button>');
tag("#page-activity .card-header .link-action","album");$$("#page-activity .photo-box").forEach(x=>x.dataset.act="photo");
const on=(s,ev,f)=>{const e=$(s);e&&e.addEventListener(ev,f)};
on("#page-residents .filter-field input","input",e=>{rf.q=e.target.value;rf.p=1;rRes()});
const rs=$$("#page-residents select");rs[0].onchange=e=>{rf.w=e.target.value;rf.p=1;rRes()};rs[1].onchange=e=>{rf.d=e.target.value;rf.p=1;rRes()};
on("#page-rooms input.grow","input",e=>{rm.q=e.target.value;rRooms()});
const ms=$$("#page-rooms select");ms[0].onchange=e=>{rm.w=e.target.value;rRooms()};ms[1].onchange=e=>{rm.s=e.target.value;rRooms()};
on("#page-reports select","change",e=>{range=e.target.value;rReports()});
on(".search-box input","input",search);
document.addEventListener("click",e=>{if(e.target.classList.contains("cd-ov"))return close();const t=e.target.closest("[data-act]");if(!t||t.disabled)return;e.preventDefault();const f=A[t.dataset.act];f&&f(t.dataset,t)});
document.addEventListener("keydown",e=>e.key==="Escape"&&close());
setInterval(()=>{if(!M){rDash();rEm()}},60000);
render();
})();
