// ══ DATA ══
const DB = {
  importers: {
    imp1: {
      id:"imp1", name:"שופרסל בע״מ", nameEn:"Shufersal Ltd", country:"ישראל",
      contact:"רחל גולד", phone:"03-9234567", email:"kosher@shufersal.co.il",
      status:"active", notes:"רשת סופרמרקטים. דורשת תעודות OU בלבד.",
      factories: ["f1","f2"]
    },
    imp2: {
      id:"imp2", name:"רמי לוי שיווק השקמה", nameEn:"Rami Levy", country:"ישראל",
      contact:"דוד אביב", phone:"02-5456789", email:"kosher@rami-levy.co.il",
      status:"active", notes:"רשת הנחות.",
      factories: ["f3"]
    },
    imp3: {
      id:"imp3", name:"Kosher World USA", nameEn:"Kosher World USA Inc.", country:"ארה״ב",
      contact:"Rabbi Stern", phone:"+1-212-5551234", email:"kosher@kosherworldusa.com",
      status:"pending", notes:"יבואן אמריקאי חדש. בתהליך רישום.",
      factories: []
    }
  },
  factories: {
    f1: {
      id:"f1", importerId:"imp1",
      name:"תעשיות מזון גולן", nameEn:"Golan Food Industries",
      nameLocal:"מפעלי גולן", brand:"Golan Foods", shortName:"GFI",
      nameNotes:"שם קודם: גולן מזון בע״מ עד 2018.",
      country:"ישראל", city:"קצרין", address:"אזה״ת קצרין 12",
      contact:"משה לוי", phone:"04-6961234", email:"moshe@golan-food.co.il",
      status:"active", notes:"מפעל ייצור מזון כשר למהדרין.",
      products: ["p1","p2"]
    },
    f2: {
      id:"f2", importerId:"imp1",
      name:"מאפיית לחם השדה", nameEn:"Lechem Hasadeh Bakery",
      country:"ישראל", city:"תל אביב", address:"רח׳ הברזל 34",
      contact:"דינה כהן", phone:"03-7654321", email:"dina@lechemhasadeh.co.il",
      status:"active", notes:"מאפייה ללחמים. ללא בשר.",
      products: ["p3"]
    },
    f3: {
      id:"f3", importerId:"imp2",
      name:"קייטרינג כהן בע״מ", nameEn:"Cohen Catering Ltd",
      country:"ישראל", city:"חיפה", address:"רח׳ הנמל 7",
      contact:"יעקב כהן", phone:"04-8765432", email:"yaakov@cohen-catering.co.il",
      status:"frozen", notes:"מוקפא עד לבירור ממצא פתוח.",
      products: []
    }
  },
  products: {
    p1: {
      id:"p1", factoryId:"f1", importerId:"imp1",
      name:"רוטב עגבניות קלאסי", barcode:"7290012345678",
      category:"רטבים ומרינדות", status:"approved",
      instructions:"ייצור בקו נפרד מחלבי. ניקוי בסיום כל משמרת.",
      notes:"מאושר מאז 2021. חידוש תעודה בדצמבר.", updatedAt:"15/11/2024",
      rawMaterials:[
        {id:"rm1",name:"עגבניות מרוסקות",supplier:"אגרקסקו",origin:"ישראל",needsCert:true,certStatus:"approved",certExpiry:"01/06/2025",notes:""},
        {id:"rm2",name:"שמן זית",supplier:"אנג׳ל",origin:"ישראל",needsCert:true,certStatus:"approved",certExpiry:"01/03/2025",notes:""},
        {id:"rm3",name:"מלח ים",supplier:"מלחי ים",origin:"ישראל",needsCert:false,certStatus:"na",certExpiry:"",notes:""},
        {id:"rm4",name:"תוסף E330",supplier:"ChemFood EU",origin:"הולנד",needsCert:true,certStatus:"pending",certExpiry:"",notes:"ממתין לאישור OU"}
      ],
      certs:[
        {name:"תעודת OU Kosher",issuer:"Orthodox Union",expiry:"01/12/2024",status:"expiring"},
        {name:"תעודת בד״ץ",issuer:"בד״ץ ירושלים",expiry:"01/06/2025",status:"valid"}
      ],
      history:[
        {date:"15/11/2024",user:"יוסף לוי",action:"עודכן סטטוס חו״ג E330"},
        {date:"10/11/2024",user:"שרה כהן",action:"הוספת תעודת בד״ץ"},
        {date:"01/11/2024",user:"מערכת",action:"נפתח תיק מוצר"}
      ]
    },
    p2: {
      id:"p2", factoryId:"f1", importerId:"imp1",
      name:"ממרח חומוס", barcode:"7290087654321",
      category:"ממרחים", status:"pending",
      instructions:"בדיקת רכיבים לפני כל ייצור.",
      notes:"מוצר חדש. טרם קיבל אישור סופי.", updatedAt:"20/11/2024",
      rawMaterials:[
        {id:"rm5",name:"חומוס",supplier:"טחינת הגליל",origin:"ישראל",needsCert:true,certStatus:"approved",certExpiry:"01/08/2025",notes:""},
        {id:"rm6",name:"טחינה גולמית",supplier:"אל-ארז",origin:"ישראל",needsCert:true,certStatus:"approved",certExpiry:"01/07/2025",notes:""},
        {id:"rm7",name:"שמן שומשום",supplier:"Orient Foods",origin:"סין",needsCert:true,certStatus:"missing",certExpiry:"",notes:"נדרש אישור ממקור"}
      ],
      certs:[],
      history:[{date:"20/11/2024",user:"מערכת",action:"נפתח תיק מוצר"}]
    },
    p3: {
      id:"p3", factoryId:"f2", importerId:"imp1",
      name:"לחם מלא", barcode:"7290099887766",
      category:"לחמים ומאפים", status:"approved",
      instructions:"אפייה בתנור ייעודי. שמירה על טמפרטורה.",
      notes:"מוצר ותיק. תעודה בתוקף.", updatedAt:"01/11/2024",
      rawMaterials:[
        {id:"rm8",name:"קמח חיטה מלאה",supplier:"טחנות רוסמן",origin:"ישראל",needsCert:true,certStatus:"approved",certExpiry:"01/09/2025",notes:""},
        {id:"rm9",name:"שמרים",supplier:"לסאפ",origin:"צרפת",needsCert:true,certStatus:"approved",certExpiry:"01/04/2025",notes:""}
      ],
      certs:[{name:"תעודת OU Kosher",issuer:"Orthodox Union",expiry:"01/06/2025",status:"valid"}],
      history:[{date:"01/11/2024",user:"מערכת",action:"נפתח תיק מוצר"}]
    }
  }
};

// ══ i18n INIT ══
document.addEventListener('DOMContentLoaded', () => {
  i18n.init(i18n.loadSaved());
});

// Dynamic content translation on lang change
document.addEventListener('langChange', (e) => {
  const t = e.detail.t;
  // Update nav buttons
  updateNavLabels(t);
});

function updateNavLabels(t) {
  // Nav groups
  const navMap = {
    'g-login': 'nav_login',
    'g-org': 'nav_org',
    'g-files': 'nav_files',
    'g-mash': 'nav_mashgiach',
    'g-admin': 'nav_admin'
  };
  document.querySelectorAll('.gnav-btn').forEach(btn => {
    const dropdown = btn.nextElementSibling;
    if(dropdown) {
      const id = dropdown.id;
      if(navMap[id] && t[navMap[id]]) btn.firstChild.textContent = t[navMap[id]] + ' ▾';
    }
  });
}

// ══ STATE ══
let currentImporterId = null;
let currentFactoryId = null;
let currentProductId = null;

// Navigation history stack
const navHistory = [];

function showScreen(id) {
  const current = document.querySelector('.screen.active');
  if(current && current.id !== id) {
    navHistory.push(current.id);
    if(navHistory.length > 20) navHistory.shift();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) { el.classList.add('active'); window.scrollTo(0,0); }
  document.querySelectorAll('.gnav-dropdown').forEach(d => d.classList.remove('open'));
}

function goBack() {
  if(navHistory.length > 0) {
    const prev = navHistory.pop();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(prev);
    if(el) { el.classList.add('active'); window.scrollTo(0,0); }
  }
}

// ══ NAVIGATION ══
// showScreen defined in STATE section

function doLogin() {
  const pass = document.getElementById('pass-inp').value;
  const routes = {'1111':'s-org-dash','2222':'s-dash','3333':'s-dash','0000':'s-admin'};
  if(routes[pass]) { showScreen(routes[pass]); }
  else { document.getElementById('login-err').style.display='block'; }
}

function toggleGnav(id, btn) {
  const dropdown = document.getElementById(id);
  const isOpen = dropdown.classList.contains('open');
  document.querySelectorAll('.gnav-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.gnav-btn').forEach(b => b.classList.remove('active'));
  if(!isOpen) { dropdown.classList.add('open'); btn.classList.add('active'); }
}

document.addEventListener('click', function(e) {
  if(!e.target.closest('.gnav-group')) {
    document.querySelectorAll('.gnav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.gnav-btn').forEach(b => b.classList.remove('active'));
  }
});

// ══ TABS ══
function switchTab(btn, paneId) {
  // Find parent container of .tabs
  const tabsEl = btn.closest('.tabs');
  if(!tabsEl) return;
  const parent = tabsEl.parentElement;
  // Deactivate all tabs and panes in this section
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if(pane) pane.classList.add('active');
}

// ══ BADGES ══
function statusBadge(s, type) {
  if(type==='importer'||type==='factory') {
    const map = {active:'<span class="badge b-green">פעיל</span>',pending:'<span class="badge b-amber">ממתין</span>',frozen:'<span class="badge b-red">מוקפא</span>'};
    return map[s]||'';
  }
  if(type==='product') {
    const map = {approved:'<span class="badge b-green">מאושר</span>',pending:'<span class="badge b-amber">בבדיקה</span>',missing:'<span class="badge b-red">חסר מסמכים</span>',rejected:'<span class="badge b-gray">לא מאושר</span>'};
    return map[s]||'';
  }
  if(type==='rm') {
    const map = {approved:'<span class="badge b-green">מאושר</span>',pending:'<span class="badge b-amber">בבדיקה</span>',missing:'<span class="badge b-red">חסר</span>',na:'<span class="badge b-gray">לא נדרש</span>'};
    return map[s]||'';
  }
  if(type==='cert') {
    const map = {valid:'<span class="badge b-green">בתוקף</span>',expiring:'<span class="badge b-amber">פג בקרוב</span>',expired:'<span class="badge b-red">פג תוקף</span>'};
    return map[s]||'';
  }
  return '';
}

// ══ IMPORTER ══
function openImporter(iid) {
  currentImporterId = iid;
  const imp = DB.importers[iid];
  if(!imp) return;

  document.getElementById('bc-importer').textContent = imp.name;
  document.getElementById('imp-name').textContent = imp.name;
  document.getElementById('imp-sub').textContent = imp.nameEn + ' · ' + imp.country;
  // Update badge safely without outerHTML
  const badgeEl = document.getElementById('imp-badge');
  if(badgeEl) {
    const bMap = {active:['b-green','פעיל'],pending:['b-amber','ממתין'],frozen:['b-red','מוקפא']};
    const [cls,txt] = bMap[imp.status]||['b-gray','—'];
    badgeEl.className = 'badge ' + cls;
    badgeEl.textContent = txt;
  }

  // form fields
  document.getElementById('imp-f-name').value = imp.name;
  document.getElementById('imp-f-name-en').value = imp.nameEn;
  document.getElementById('imp-f-country').value = imp.country;
  document.getElementById('imp-f-contact').value = imp.contact;
  document.getElementById('imp-f-phone').value = imp.phone;
  document.getElementById('imp-f-email').value = imp.email;
  document.getElementById('imp-f-notes').value = imp.notes;

  // metrics
  const facList = imp.factories;
  let totalProducts = 0, totalApproved = 0;
  facList.forEach(fid => {
    const f = DB.factories[fid];
    if(f) { totalProducts += f.products.length; f.products.forEach(pid => { if(DB.products[pid]&&DB.products[pid].status==='approved') totalApproved++; }); }
  });
  document.getElementById('imp-m1').textContent = facList.length;
  document.getElementById('imp-m2').textContent = totalProducts;
  document.getElementById('imp-m3').textContent = totalApproved;

  // factories list
  const list = document.getElementById('imp-factories-list');
  if(facList.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">אין מפעלים — לחץ "מפעל חדש"</div>';
  } else {
    list.innerHTML = facList.map(fid => {
      const f = DB.factories[fid];
      if(!f) return '';
      return `<button class="list-card" onclick="openFactory('${fid}')" style="width:100%;text-align:right;font-family:inherit">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:8px;background:var(--green-bg);display:flex;align-items:center;justify-content:center;font-size:16px">🏭</div>
            <div><div class="list-card-title">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.city}, ${f.country}</div></div>
          </div>
          ${statusBadge(f.status,'factory')}
        </div>
        <div class="list-card-meta"><span>👤 ${f.contact}</span><span>📦 ${f.products.length} מוצרים</span></div>
      </div>`;
    }).join('');
  }

  // reset tabs
  document.querySelectorAll('#s-importer-file .tab-btn').forEach((b,i)=>{b.classList.toggle('active',i===0)});
  document.querySelectorAll('#s-importer-file .tab-pane').forEach((p,i)=>{p.classList.toggle('active',i===0)});

  // Update breadcrumb back text
  const bcImp2 = document.getElementById('bc-imp2-text');
  if(bcImp2) bcImp2.textContent = imp.name;
  showScreen('s-importer-file');
}

// ══ FACTORY ══
function openFactory(fid) {
  currentFactoryId = fid;
  const f = DB.factories[fid];
  const imp = DB.importers[f.importerId];
  if(!f) return;

  document.getElementById('bc-imp2').textContent = imp ? imp.name : '';
  document.getElementById('bc-factory').textContent = f.name;
  document.getElementById('fac-name').textContent = f.name;
  document.getElementById('fac-sub').textContent = f.nameEn + ' · ' + f.city + ', ' + f.country;
  document.getElementById('back-to-imp-lbl').textContent = 'חזרה לתיק יבואן — ' + (imp?imp.name:'');
  document.getElementById('fac-products-sub').textContent = 'מוצרים עבור ' + (imp?imp.name:'');

  // form
  document.getElementById('fac-f-name').value = f.name || '';
  document.getElementById('fac-f-name-en').value = f.nameEn || '';
  document.getElementById('fac-f-name-local').value = f.nameLocal || '';
  document.getElementById('fac-f-brand').value = f.brand || '';
  document.getElementById('fac-f-short').value = f.shortName || '';
  document.getElementById('fac-f-name-notes').value = f.nameNotes || '';
  document.getElementById('fac-f-country').value = f.country || '';
  document.getElementById('fac-f-city').value = f.city || '';
  document.getElementById('fac-f-address').value = f.address || '';
  document.getElementById('fac-f-contact').value = f.contact || '';
  document.getElementById('fac-f-phone').value = f.phone || '';
  document.getElementById('fac-f-email').value = f.email || '';
  document.getElementById('fac-f-notes').value = f.notes || '';

  // badge
  const badgeEl = document.getElementById('fac-badge');
  if(badgeEl) {
    const bMap = {active:['b-green','פעיל'],pending:['b-amber','ממתין'],frozen:['b-red','מוקפא']};
    const [cls,txt] = bMap[f.status]||['b-gray','—'];
    badgeEl.className = 'badge ' + cls;
    badgeEl.textContent = txt;
  }

  // products list
  const list = document.getElementById('fac-products-list');
  if(f.products.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">אין מוצרים — לחץ "מוצר חדש"</div>';
  } else {
    list.innerHTML = f.products.map(pid => {
      const p = DB.products[pid];
      if(!p) return '';
      return `<button class="list-card" onclick="openProduct('${pid}')" style="width:100%;text-align:right;font-family:inherit">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="list-card-title">${p.name}</div>
            <div style="font-size:11px;color:var(--text3)">${p.category}${p.barcode?' · ברקוד: '+p.barcode:''} · עודכן: ${p.updatedAt}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${statusBadge(p.status,'product')}
            <span style="font-size:11px;color:var(--text3)">${p.rawMaterials.length} חו״ג</span>
            <span style="color:var(--blue)">←</span>
          </div>
        </div>
      </button>`;
    }).join('');
  }

  // reset tabs
  document.querySelectorAll('#s-factory-file .tab-btn').forEach((b,i)=>{b.classList.toggle('active',i===0)});
  document.querySelectorAll('#s-factory-file .tab-pane').forEach((p,i)=>{p.classList.toggle('active',i===0)});

  renderFactoryReports(fid);
  updateFactoryAddressTab(f);
  renderRMTable(fid);
  renderSupervisionList(fid);
  renderProjectsTab(fid);
  renderProductsList(fid);
  updateVisitsDisplay(fid);
  showScreen('s-factory-file');
}

function goBackToImporter() { if(currentImporterId) openImporter(currentImporterId); else showScreen('s-importers'); }
function goBackToFactory() { if(currentFactoryId) openFactory(currentFactoryId); else showScreen('s-importers'); }

// ══ PRODUCT ══
function openProduct(pid) {
  currentProductId = pid;
  const p = DB.products[pid];
  const f = DB.factories[p.factoryId];
  const imp = DB.importers[p.importerId];
  if(!p) return;

  document.getElementById('bc-imp3').textContent = imp ? imp.name : '';
  document.getElementById('bc-fac3').textContent = f ? f.name : '';
  document.getElementById('bc-product').textContent = p.name;
  document.getElementById('prod-name').textContent = p.name;
  document.getElementById('prod-sub').textContent = (f?f.name:'') + ' → ' + (imp?imp.name:'') + ' · ' + p.category + (p.barcode?' · ברקוד: '+p.barcode:'');
  document.getElementById('back-to-fac-lbl').textContent = 'חזרה לתיק מפעל — ' + (f?f.name:'');

  // badge
  const badgeEl = document.getElementById('prod-badge');
  badgeEl.className = 'badge';
  const bMap = {approved:'b-green מאושר',pending:'b-amber בבדיקה',missing:'b-red חסר מסמכים',rejected:'b-gray לא מאושר'};
  const bParts = (bMap[p.status]||'b-gray לא ידוע').split(' ');
  badgeEl.className = 'badge ' + bParts[0];
  badgeEl.textContent = bParts[1];

  // metrics
  const approved = p.rawMaterials.filter(r=>r.certStatus==='approved').length;
  const pending = p.rawMaterials.filter(r=>r.certStatus==='pending').length;
  const missing = p.rawMaterials.filter(r=>r.certStatus==='missing').length;
  document.getElementById('prod-m1').textContent = approved;
  document.getElementById('prod-m2').textContent = pending;
  document.getElementById('prod-m3').textContent = missing;
  document.getElementById('prod-m4').textContent = p.certs.length;

  // details
  document.getElementById('prod-details-rows').innerHTML = [
    ['שם מוצר',p.name],['קטגוריה',p.category],['ברקוד',p.barcode||'—'],['עדכון אחרון',p.updatedAt]
  ].map(([k,v])=>`<div style="display:flex;gap:8px;margin-bottom:7px;font-size:13px"><span style="color:var(--text3);min-width:90px">${k}</span><span>${v}</span></div>`).join('');

  document.getElementById('prod-assoc-rows').innerHTML = [
    ['יבואן',imp?imp.name:'—'],['מפעל',f?f.name:'—']
  ].map(([k,v])=>`<div style="display:flex;gap:8px;margin-bottom:7px;font-size:13px"><span style="color:var(--text3);min-width:60px">${k}</span><span>${v}</span></div>`).join('') +
  `<div style="display:flex;gap:8px;margin-bottom:7px;font-size:13px"><span style="color:var(--text3);min-width:60px">סטטוס</span>${statusBadge(p.status,'product')}</div>`;

  // raw materials
  document.getElementById('prod-rm-tbody').innerHTML = p.rawMaterials.map(rm=>`
    <tr>
      <td style="font-weight:500">${rm.name}</td>
      <td>${rm.supplier}</td>
      <td>${rm.origin}</td>
      <td>${rm.needsCert?'<span class="badge b-blue" style="font-size:10px">כן</span>':'<span class="badge b-gray" style="font-size:10px">לא</span>'}</td>
      <td>${statusBadge(rm.certStatus,'rm')}</td>
      <td style="font-size:12px;color:${rm.certExpiry?'var(--text)':'var(--text3)'}">${rm.certExpiry||'—'}</td>
      <td style="font-size:12px;color:var(--text3)">${rm.notes||'—'}</td>
      <td><button class="tbl-btn">עריכה</button></td>
    </tr>`).join('');

  // certs
  const certsList = document.getElementById('prod-certs-list');
  if(p.certs.length===0) {
    certsList.innerHTML = '<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">אין תעודות</div>';
  } else {
    certsList.innerHTML = p.certs.map(c=>`
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:0.5px solid var(--border);border-radius:var(--rs);padding:12px 16px;margin-bottom:8px">
        <div><div style="font-size:13px;font-weight:500;margin-bottom:2px">${c.name}</div><div style="font-size:11px;color:var(--text3)">מנפיק: ${c.issuer} · תוקף: ${c.expiry}</div></div>
        <div style="display:flex;gap:8px;align-items:center">${statusBadge(c.status,'cert')}<button class="tbl-btn">הורד</button></div>
      </div>`).join('');
  }

  // instructions
  document.getElementById('prod-instr-mash').value = p.instructions||'';

  // notes & history
  document.getElementById('prod-notes-ta').value = p.notes||'';
  document.getElementById('prod-history-list').innerHTML = p.history.map(h=>`
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);font-size:12px">
      <span style="color:var(--text3);min-width:80px;flex-shrink:0">${h.date}</span>
      <span style="color:var(--blue);min-width:70px;flex-shrink:0">${h.user}</span>
      <span>${h.action}</span>
    </div>`).join('');

  // reset tabs
  document.querySelectorAll('#s-product-file .tab-btn').forEach((b,i)=>{b.classList.toggle('active',i===0)});
  document.querySelectorAll('#s-product-file .tab-pane').forEach((p,i)=>{p.classList.toggle('active',i===0)});

  showScreen('s-product-file');
}

// ══ UTILS ══
function filterList(listId, val, titleClass) {
  const items = document.getElementById(listId).querySelectorAll('.list-card');
  items.forEach(item => {
    const title = item.querySelector('.'+titleClass);
    item.style.display = (!val || (title && title.textContent.includes(val))) ? '' : 'none';
  });
}

function filterByBadge(listId, val) {
  const items = document.getElementById(listId).querySelectorAll('.list-card');
  items.forEach(item => {
    item.style.display = (!val || item.textContent.includes(val)) ? '' : 'none';
  });
}

function clearFilters(listId) {
  document.getElementById(listId).querySelectorAll('.list-card').forEach(i=>i.style.display='');
}

function toggleDiscountForm() {
  const f = document.getElementById('discount-form-wrap');
  f.style.display = f.style.display==='none' ? 'block' : 'none';
}

function saveDiscount() {
  const code = document.getElementById('dc-code').value.trim().toUpperCase();
  if(!code){alert('נא להזין קוד');return;}
  alert('קוד ' + code + ' נשמר!');
  toggleDiscountForm();
}

// ══════════════════════════════════════════════
//  KashrutCRM — i18n System
//  הוסף שפה חדשה: הוסף קובץ שפה ל-TRANSLATIONS
// ══════════════════════════════════════════════

const TRANSLATIONS = {

  // ─── עברית ───────────────────────────────
  he: {
    dir: "rtl",
    name: "עברית",
    flag: "🇮🇱",

    // General
    app_name: "KashrutCRM",
    logout: "יציאה",
    save: "שמור",
    cancel: "ביטול",
    edit: "עריכה",
    add: "הוסף",
    search: "חיפוש",
    clear_filters: "נקה פילטרים",
    back: "חזרה",
    loading: "טוען...",
    no_data: "אין נתונים",
    actions: "פעולות",
    status: "סטטוס",
    details: "פרטים",
    notes: "הערות",
    history: "היסטוריה",
    date: "תאריך",
    name: "שם",
    phone: "טלפון",
    email: "אימייל",
    country: "מדינה",
    city: "עיר",
    address: "כתובת",
    contact: "איש קשר",
    new: "חדש",
    download: "הורד",
    upload: "העלה",
    send: "שלח",

    // Status
    status_active: "פעיל",
    status_pending: "ממתין",
    status_frozen: "מוקפא",
    status_approved: "מאושר",
    status_reviewing: "בבדיקה",
    status_missing: "חסר מסמכים",
    status_rejected: "לא מאושר",
    status_valid: "בתוקף",
    status_expiring: "פג בקרוב",
    status_expired: "פג תוקף",
    status_required: "כן",
    status_not_required: "לא",

    // Login
    login_title: "כניסה למערכת",
    login_subtitle: "מערכת ניהול כשרות",
    login_email: "כתובת אימייל",
    login_password: "סיסמה",
    login_btn: "כניסה למערכת",
    login_error: "סיסמה שגויה. נסה: 1111 / 2222 / 0000",
    login_demo: "כניסה מהירה לדמו",
    login_org: "גוף כשרות",
    login_org_sub: "ניהול משגיחים ומפעלים",
    login_mashgiach: "משגיח",
    login_mashgiach_sub: "זמינות ופרויקטים",
    login_admin: "מנהל מערכת",
    login_admin_sub: "גופי כשרות ורישיונות",
    choose_lang: "בחר שפה",

    // Nav
    nav_org: "גוף כשרות",
    nav_files: "תיקי כשרות",
    nav_mashgiach: "משגיח",
    nav_admin: "אדמין",
    nav_login: "כניסה",
    nav_dashboard: "לוח בקרה",
    nav_mashgichim: "משגיחים",
    nav_certs: "תעודות",
    nav_importers: "יבואנים ולקוחות",
    nav_importer_file: "תיק יבואן",
    nav_factory_file: "תיק מפעל",
    nav_product_file: "תיק מוצר",
    nav_avail: "זמינות",
    nav_personal: "פרופיל אישי",
    nav_pricing: "מחירים",
    nav_discounts: "הנחות",

    // Org Dashboard
    org_dashboard: "לוח בקרה",
    org_mashgichim: "משגיחים",
    org_importers: "יבואנים ולקוחות",
    org_quick_access: "כניסה מהירה",
    org_alerts: "התראות",

    // Importers
    importers_title: "יבואנים ולקוחות",
    importer_new: "+ יבואן חדש",
    importer_factories: "מפעלים",
    importer_products: "מוצרים",
    importer_approved: "מוצרים מאושרים",
    importer_tab_factories: "מפעלים",
    importer_tab_info: "פרטי יבואן",
    importer_tab_notes: "הערות",
    importer_no_factories: "אין מפעלים — לחץ \'מפעל חדש\'",
    importer_factory_new: "+ מפעל חדש",
    back_to_importers: "חזרה לרשימת יבואנים",
    back_to_dashboard: "חזרה ללוח בקרה",

    // Factory
    factory_title: "תיק מפעל",
    factory_tab_products: "מוצרים",
    factory_tab_info: "פרטי מפעל",
    factory_tab_notes: "הערות",
    factory_product_new: "+ מוצר חדש",
    factory_no_products: "אין מוצרים — לחץ 'מוצר חדש'",
    factory_name: "שם מפעל",
    factory_name_en: "שם באנגלית",
    back_to_importer: "חזרה לתיק יבואן",

    // Product
    product_title: "תיק מוצר",
    product_tab_details: "פרטי מוצר",
    product_tab_rawmat: "חומרי גלם",
    product_tab_certs: "תעודות",
    product_tab_label: "תווית מוצר",
    product_tab_instr: "הוראות ייצור",
    product_tab_docs: "מסמכים",
    product_tab_history: "הערות והיסטוריה",
    product_name: "שם מוצר",
    product_category: "קטגוריה",
    product_barcode: "ברקוד",
    product_last_update: "עדכון אחרון",
    product_importer: "יבואן",
    product_factory: "מפעל",
    product_rm_approved: "חו״ג מאושרים",
    product_rm_pending: "ממתינים",
    product_rm_missing: "חסרים",
    product_certs_count: "תעודות",
    product_no_certs: "אין תעודות",
    product_no_label: "לא הועלתה תווית עדיין",
    product_no_docs: "לא הועלו מסמכים",
    product_instr_mashgiach: "הוראות ייצור למשגיח",
    product_instr_factory: "הוראות למפעל",
    product_label_formats: "קבצים נתמכים: PDF, PNG, JPG · עד 10MB",
    product_docs_formats: "PDF, Word, Excel, תמונות · עד 20MB לקובץ",
    back_to_factory: "חזרה לתיק מפעל",

    // Raw materials
    rm_name: "שם חומר גלם",
    rm_supplier: "ספק",
    rm_origin: "ארץ מקור",
    rm_needs_cert: "נדרש אישור",
    rm_cert_status: "סטטוס אישור",
    rm_cert_expiry: "תוקף תעודה",
    rm_notes: "הערות",
    rm_new: "+ חומר גלם",
    rm_edit: "עריכה",

    // Certs
    cert_issuer: "מנפיק",
    cert_expiry: "תוקף",
    cert_new: "+ תעודה",

    // Mashgiach
    mash_dashboard: "לוח בקרה",
    mash_avail: "זמינות",
    mash_personal: "פרופיל אישי",
    mash_avail_title: "לוח זמינות",
    mash_status_available: "זמין",
    mash_status_prefer_not: "עדיף שלא",
    mash_status_unavailable: "לא זמין",
    mash_edit_avail: "עריכת זמינות",

    // Personal
    personal_title: "פרופיל אישי",
    personal_name_he: "שם בעברית",
    personal_name_en: "Name in English",
    personal_first: "שם פרטי",
    personal_middle: "שם נוסף",
    personal_last: "שם משפחה",
    personal_first_en: "First name",
    personal_middle_en: "Middle name",
    personal_last_en: "Last name",
    personal_lang: "שפת מערכת מועדפת",
    personal_save: "שמור שינויים",

    // Admin
    admin_title: "לוח בקרה — מנהל מערכת",
    admin_orgs: "גופי כשרות",
    admin_mashgichim: "משגיחים",
    admin_licenses: "רשיונות פעילים",
    admin_expiring: "פגים בקרוב",
    admin_pricing: "ניהול מחירים",
    admin_discounts: "ניהול הנחות",
    admin_pricing_title: "ניהול מחירים",
    admin_discount_title: "ניהול קודי הנחה",
    admin_discount_new: "+ קוד חדש",
    admin_discount_code: "קוד",
    admin_discount_amount: "אחוז הנחה",
    admin_discount_expiry: "תוקף עד",
    admin_discount_note: "הערה",
    admin_discount_save: "שמור",
    admin_discount_existing: "קודי הנחה קיימים",
    admin_discount_uses: "שימושים",

    // Language switcher
    lang_switcher: "שפה",
    lang_he: "עברית",
    lang_en: "English",
    lang_es: "Español",

    // Months
    month_jan: "ינואר', month_feb: 'פברואר', month_mar: 'מרץ",
    month_apr: "אפריל', month_may: 'מאי', month_jun: 'יוני",
    month_jul: "יולי', month_aug: 'אוגוסט', month_sep: 'ספטמבר",
    month_oct: "אוקטובר', month_nov: 'נובמבר', month_dec: 'דצמבר",

    // Days
    day_sun: "א׳', day_mon: 'ב׳', day_tue: 'ג׳', day_wed: 'ד׳",
    day_thu: "ה׳', day_fri: 'ו׳', day_sat: 'ש׳",

    // All statuses
    all_statuses: "כל הסטטוסים",
    all_langs: "כל השפות",
  },

  // ─── English ─────────────────────────────
  en: {
    dir: "ltr",
    name: "English",
    flag: "🇬🇧",

    app_name: "KashrutCRM",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    add: "Add",
    search: "Search",
    clear_filters: "Clear Filters",
    back: "Back",
    loading: "Loading...",
    no_data: "No data",
    actions: "Actions",
    status: "Status",
    details: "Details",
    notes: "Notes",
    history: "History",
    date: "Date",
    name: "Name",
    phone: "Phone",
    email: "Email",
    country: "Country",
    city: "City",
    address: "Address",
    contact: "Contact",
    new: "New",
    download: "Download",
    upload: "Upload",
    send: "Send",

    status_active: "Active",
    status_pending: "Pending",
    status_frozen: "Frozen",
    status_approved: "Approved",
    status_reviewing: "Under Review",
    status_missing: "Missing Docs",
    status_rejected: "Not Approved",
    status_valid: "Valid",
    status_expiring: "Expiring Soon",
    status_expired: "Expired",
    status_required: "Yes",
    status_not_required: "No",

    login_title: "Sign In",
    login_subtitle: "Kosher Certification Management",
    login_email: "Email address",
    login_password: "Password",
    login_btn: "Sign In",
    login_error: "Wrong password. Try: 1111 / 2222 / 0000",
    login_demo: "Quick Demo Login",
    login_org: "Kosher Authority",
    login_org_sub: "Manage inspectors & factories",
    login_mashgiach: "Inspector",
    login_mashgiach_sub: "Availability & projects",
    login_admin: "System Admin",
    login_admin_sub: "Authorities & licenses",
    choose_lang: "Choose Language",

    nav_org: "Kosher Authority",
    nav_files: "Kosher Files",
    nav_mashgiach: "Inspector",
    nav_admin: "Admin",
    nav_login: "Login",
    nav_dashboard: "Dashboard",
    nav_mashgichim: "Inspectors",
    nav_certs: "Certificates",
    nav_importers: "Importers & Clients",
    nav_importer_file: "Importer File",
    nav_factory_file: "Factory File",
    nav_product_file: "Product File",
    nav_avail: "Availability",
    nav_personal: "Personal Profile",
    nav_pricing: "Pricing",
    nav_discounts: "Discounts",

    org_dashboard: "Dashboard",
    org_mashgichim: "Inspectors",
    org_importers: "Importers & Clients",
    org_quick_access: "Quick Access",
    org_alerts: "Alerts",

    importers_title: "Importers & Clients",
    importer_new: "+ New Importer",
    importer_factories: "Factories",
    importer_products: "Products",
    importer_approved: "Approved Products",
    importer_tab_factories: "Factories",
    importer_tab_info: "Importer Details",
    importer_tab_notes: "Notes",
    importer_no_factories: "No factories — click 'New Factory'",
    importer_factory_new: "+ New Factory",
    back_to_importers: "Back to Importers",
    back_to_dashboard: "Back to Dashboard",

    factory_title: "Factory File",
    factory_tab_products: "Products",
    factory_tab_info: "Factory Details",
    factory_tab_notes: "Notes",
    factory_product_new: "+ New Product",
    factory_no_products: "No products — click 'New Product'",
    factory_name: "Factory Name",
    factory_name_en: "Name in English",
    back_to_importer: "Back to Importer File",

    product_title: "Product File",
    product_tab_details: "Product Details",
    product_tab_rawmat: "Raw Materials",
    product_tab_certs: "Certificates",
    product_tab_label: "Product Label",
    product_tab_instr: "Production Instructions",
    product_tab_docs: "Documents",
    product_tab_history: "Notes & History",
    product_name: "Product Name",
    product_category: "Category",
    product_barcode: "Barcode",
    product_last_update: "Last Updated",
    product_importer: "Importer",
    product_factory: "Factory",
    product_rm_approved: "Approved RM",
    product_rm_pending: "Pending",
    product_rm_missing: "Missing",
    product_certs_count: "Certificates",
    product_no_certs: "No certificates",
    product_no_label: "No label uploaded yet",
    product_no_docs: "No documents uploaded",
    product_instr_mashgiach: "Instructions for Inspector",
    product_instr_factory: "Instructions for Factory",
    product_label_formats: "Supported: PDF, PNG, JPG · Max 10MB",
    product_docs_formats: "PDF, Word, Excel, Images · Max 20MB per file",
    back_to_factory: "Back to Factory File",

    rm_name: "Raw Material",
    rm_supplier: "Supplier",
    rm_origin: "Country of Origin",
    rm_needs_cert: "Cert Required",
    rm_cert_status: "Cert Status",
    rm_cert_expiry: "Cert Expiry",
    rm_notes: "Notes",
    rm_new: "+ Add Raw Material",
    rm_edit: "Edit",

    cert_issuer: "Issuer",
    cert_expiry: "Expiry",
    cert_new: "+ Add Certificate",

    mash_dashboard: "Dashboard",
    mash_avail: "Availability",
    mash_personal: "Personal Profile",
    mash_avail_title: "Availability Calendar",
    mash_status_available: "Available",
    mash_status_prefer_not: "Prefer Not",
    mash_status_unavailable: "Unavailable",
    mash_edit_avail: "Edit Availability",

    personal_title: "Personal Profile",
    personal_name_he: "Name in Hebrew",
    personal_name_en: "Name in English",
    personal_first: "First Name",
    personal_middle: "Middle Name",
    personal_last: "Last Name",
    personal_first_en: "First name",
    personal_middle_en: "Middle name",
    personal_last_en: "Last name",
    personal_lang: "Preferred System Language",
    personal_save: "Save Changes",

    admin_title: "System Admin Dashboard",
    admin_orgs: "Kosher Authorities",
    admin_mashgichim: "Inspectors",
    admin_licenses: "Active Licenses",
    admin_expiring: "Expiring Soon",
    admin_pricing: "Pricing Management",
    admin_discounts: "Discount Management",
    admin_pricing_title: "Pricing Management",
    admin_discount_title: "Manage Discount Codes",
    admin_discount_new: "+ New Code",
    admin_discount_code: "Code",
    admin_discount_amount: "Discount %",
    admin_discount_expiry: "Valid Until",
    admin_discount_note: "Note",
    admin_discount_save: "Save",
    admin_discount_existing: "Existing Codes",
    admin_discount_uses: "Uses",

    lang_switcher: "Language",
    lang_he: "עברית",
    lang_en: "English",
    lang_es: "Español",

    month_jan: "January', month_feb: 'February', month_mar: 'March",
    month_apr: "April', month_may: 'May', month_jun: 'June",
    month_jul: "July', month_aug: 'August', month_sep: 'September",
    month_oct: "October', month_nov: 'November', month_dec: 'December",

    day_sun: "Sun', day_mon: 'Mon', day_tue: 'Tue', day_wed: 'Wed",
    day_thu: "Thu', day_fri: 'Fri', day_sat: 'Sat",

    all_statuses: "All Statuses",
    all_langs: "All Languages",
  },

  // ─── Español ─────────────────────────────
  es: {
    dir: "ltr",
    name: "Español",
    flag: "🇪🇸",

    app_name: "KashrutCRM",
    logout: "Salir",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    add: "Agregar",
    search: "Buscar",
    clear_filters: "Limpiar filtros",
    back: "Volver",
    loading: "Cargando...",
    no_data: "Sin datos",
    actions: "Acciones",
    status: "Estado",
    details: "Detalles",
    notes: "Notas",
    history: "Historial",
    date: "Fecha",
    name: "Nombre",
    phone: "Teléfono",
    email: "Email",
    country: "País",
    city: "Ciudad",
    address: "Dirección",
    contact: "Contacto",
    new: "Nuevo",
    download: "Descargar",
    upload: "Subir",
    send: "Enviar",

    status_active: "Activo",
    status_pending: "Pendiente",
    status_frozen: "Congelado",
    status_approved: "Aprobado",
    status_reviewing: "En revisión",
    status_missing: "Documentos faltantes",
    status_rejected: "No aprobado",
    status_valid: "Válido",
    status_expiring: "Por vencer",
    status_expired: "Vencido",
    status_required: "Sí",
    status_not_required: "No",

    login_title: "Iniciar sesión",
    login_subtitle: "Gestión de certificación kosher",
    login_email: "Correo electrónico",
    login_password: "Contraseña",
    login_btn: "Iniciar sesión",
    login_error: "Contraseña incorrecta. Prueba: 1111 / 2222 / 0000",
    login_demo: "Acceso rápido de demostración",
    login_org: "Autoridad Kosher",
    login_org_sub: "Gestionar inspectores y fábricas",
    login_mashgiach: "Inspector",
    login_mashgiach_sub: "Disponibilidad y proyectos",
    login_admin: "Administrador",
    login_admin_sub: "Autoridades y licencias",
    choose_lang: "Elige idioma",

    nav_org: "Autoridad Kosher",
    nav_files: "Archivos Kosher",
    nav_mashgiach: "Inspector",
    nav_admin: "Admin",
    nav_login: "Acceso",
    nav_dashboard: "Panel",
    nav_mashgichim: "Inspectores",
    nav_certs: "Certificados",
    nav_importers: "Importadores",
    nav_importer_file: "Archivo Importador",
    nav_factory_file: "Archivo Fábrica",
    nav_product_file: "Archivo Producto",
    nav_avail: "Disponibilidad",
    nav_personal: "Perfil personal",
    nav_pricing: "Precios",
    nav_discounts: "Descuentos",

    org_dashboard: "Panel de control",
    org_mashgichim: "Inspectores",
    org_importers: "Importadores y clientes",
    org_quick_access: "Acceso rápido",
    org_alerts: "Alertas",

    importers_title: "Importadores y clientes",
    importer_new: "+ Nuevo importador",
    importer_factories: "Fábricas",
    importer_products: "Productos",
    importer_approved: "Productos aprobados",
    importer_tab_factories: "Fábricas",
    importer_tab_info: "Datos del importador",
    importer_tab_notes: "Notas",
    importer_no_factories: "Sin fábricas",
    importer_factory_new: "+ Nueva fábrica",
    back_to_importers: "Volver a importadores",
    back_to_dashboard: "Volver al panel",

    factory_title: "Archivo de fábrica",
    factory_tab_products: "Productos",
    factory_tab_info: "Datos de la fábrica",
    factory_tab_notes: "Notas",
    factory_product_new: "+ Nuevo producto",
    factory_no_products: "Sin productos",
    factory_name: "Nombre de la fábrica",
    factory_name_en: "Nombre en inglés",
    back_to_importer: "Volver al importador",

    product_title: "Archivo de producto",
    product_tab_details: "Detalles del producto",
    product_tab_rawmat: "Materias primas",
    product_tab_certs: "Certificados",
    product_tab_label: "Etiqueta del producto",
    product_tab_instr: "Instrucciones de producción",
    product_tab_docs: "Documentos",
    product_tab_history: "Notas e historial",
    product_name: "Nombre del producto",
    product_category: "Categoría",
    product_barcode: "Código de barras",
    product_last_update: "Última actualización",
    product_importer: "Importador",
    product_factory: "Fábrica",
    product_rm_approved: "MP aprobadas",
    product_rm_pending: "Pendientes",
    product_rm_missing: "Faltantes",
    product_certs_count: "Certificados",
    product_no_certs: "Sin certificados",
    product_no_label: "Sin etiqueta",
    product_no_docs: "Sin documentos",
    product_instr_mashgiach: "Instrucciones para el inspector",
    product_instr_factory: "Instrucciones para la fábrica",
    product_label_formats: "PDF, PNG, JPG · Máx 10MB",
    product_docs_formats: "PDF, Word, Excel · Máx 20MB",
    back_to_factory: "Volver a la fábrica",

    rm_name: "Materia prima",
    rm_supplier: "Proveedor",
    rm_origin: "País de origen",
    rm_needs_cert: "Cert. requerida",
    rm_cert_status: "Estado cert.",
    rm_cert_expiry: "Vencimiento cert.",
    rm_notes: "Notas",
    rm_new: "+ Agregar materia prima",
    rm_edit: "Editar",

    cert_issuer: "Emisor",
    cert_expiry: "Vencimiento",
    cert_new: "+ Agregar certificado",

    mash_dashboard: "Panel",
    mash_avail: "Disponibilidad",
    mash_personal: "Perfil personal",
    mash_avail_title: "Calendario de disponibilidad",
    mash_status_available: "Disponible",
    mash_status_prefer_not: "Prefiere no",
    mash_status_unavailable: "No disponible",
    mash_edit_avail: "Editar disponibilidad",

    personal_title: "Perfil personal",
    personal_name_he: "Nombre en hebreo",
    personal_name_en: "Nombre en inglés",
    personal_first: "Nombre",
    personal_middle: "Segundo nombre",
    personal_last: "Apellido",
    personal_first_en: "First name",
    personal_middle_en: "Middle name",
    personal_last_en: "Last name",
    personal_lang: "Idioma preferido del sistema",
    personal_save: "Guardar cambios",

    admin_title: "Panel de administrador",
    admin_orgs: "Autoridades Kosher",
    admin_mashgichim: "Inspectores",
    admin_licenses: "Licencias activas",
    admin_expiring: "Por vencer",
    admin_pricing: "Gestión de precios",
    admin_discounts: "Gestión de descuentos",
    admin_pricing_title: "Gestión de precios",
    admin_discount_title: "Códigos de descuento",
    admin_discount_new: "+ Nuevo código",
    admin_discount_code: "Código",
    admin_discount_amount: "% Descuento",
    admin_discount_expiry: "Válido hasta",
    admin_discount_note: "Nota",
    admin_discount_save: "Guardar",
    admin_discount_existing: "Códigos existentes",
    admin_discount_uses: "Usos",

    lang_switcher: "Idioma",
    lang_he: "עברית",
    lang_en: "English",
    lang_es: "Español",

    month_jan: "Enero', month_feb: 'Febrero', month_mar: 'Marzo",
    month_apr: "Abril', month_may: 'Mayo', month_jun: 'Junio",
    month_jul: "Julio', month_aug: 'Agosto', month_sep: 'Septiembre",
    month_oct: "Octubre', month_nov: 'Noviembre', month_dec: 'Diciembre",

    day_sun: "Dom', day_mon: 'Lun', day_tue: 'Mar', day_wed: 'Mié",
    day_thu: "Jue', day_fri: 'Vie', day_sat: 'Sáb",

    all_statuses: "Todos los estados",
    all_langs: "Todos los idiomas",
  }
};

// ══ i18n Engine ══
const i18n = {
  currentLang: 'he',

  // Detect browser language
  detectBrowserLang() {
    const nav = navigator.language || navigator.userLanguage || 'he';
    const code = nav.toLowerCase().substring(0,2);
    if(code === 'he') return 'he';
    if(code === 'es') return 'es';
    return 'en';
  },

  // Initialize
  init(lang) {
    this.currentLang = lang || this.detectBrowserLang();
    this.applyLang();
  },

  // Set language
  setLang(lang) {
    if(!TRANSLATIONS[lang]) return;
    this.currentLang = lang;
    // Save to localStorage if available
    try { localStorage.setItem('kashrut_lang', lang); } catch(e) {}
    this.applyLang();
  },

  // Load saved or detected language
  loadSaved() {
    try {
      const saved = localStorage.getItem('kashrut_lang');
      if(saved && TRANSLATIONS[saved]) return saved;
    } catch(e) {}
    return this.detectBrowserLang();
  },

  // Apply language to document
  applyLang() {
    const t = TRANSLATIONS[this.currentLang];
    if(!t) return;
    // RTL/LTR
    document.documentElement.dir = t.dir;
    document.documentElement.lang = this.currentLang;
    document.body.dir = t.dir;
    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if(t[key] !== undefined) {
        if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    // Update placeholders [data-i18n-ph]
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if(t[key] !== undefined) el.placeholder = t[key];
    });
    // Update lang switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const l = btn.getAttribute('data-lang');
      btn.classList.toggle('active', l === this.currentLang);
    });
    // Fire event for dynamic content
    document.dispatchEvent(new CustomEvent('langChange', {detail: {lang: this.currentLang, t}}));
  },

  // Translate a key
  t(key) {
    return (TRANSLATIONS[this.currentLang] || {})[key] || (TRANSLATIONS['he'] || {})[key] || key;
  },

  // Get current dir
  get dir() { return (TRANSLATIONS[this.currentLang]||{}).dir || 'rtl'; },

  // Get all languages
  get languages() { return Object.keys(TRANSLATIONS).map(k => ({code:k, name:TRANSLATIONS[k].name, flag:TRANSLATIONS[k].flag})); }
};

// Alias for convenience
const t = (key) => i18n.t(key);

function openNewFactory() {
  const imp = DB.importers[currentImporterId];
  const sub = document.getElementById('new-fac-importer-sub');
  if(sub && imp) sub.textContent = 'עבור: ' + imp.name;
  // Clear form
  ['nf-name-he','nf-name-en','nf-name-local','nf-brand','nf-short','nf-address','nf-city','nf-contact','nf-role','nf-phone','nf-email','nf-notes','nf-name-notes'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const countryEl = document.getElementById('nf-country');
  if(countryEl) countryEl.value = '';
  document.querySelectorAll('input[name="nf-status"]')[0].checked = true;
  const mapLinks = document.getElementById('nf-map-links');
  if(mapLinks) mapLinks.style.display = 'none';
  showScreen('s-new-factory');
}

function updateMapLinks() {
  const country = document.getElementById('nf-country').value;
  const city = document.getElementById('nf-city').value;
  const address = document.getElementById('nf-address').value;
  const linksDiv = document.getElementById('nf-map-links');
  if(!linksDiv) return;
  if(!country && !address) { linksDiv.style.display = 'none'; return; }
  const query = encodeURIComponent([address, city, country].filter(Boolean).join(', '));
  const isChinese = country === 'סין';
  let html = '';
  if(isChinese) {
    html += `<a href="https://map.baidu.com/search/${query}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--border);font-size:12px;color:var(--text2);text-decoration:none;background:var(--gray-bg)">🗺️ Baidu Maps</a>`;
    html += `<a href="https://www.openstreetmap.org/search?query=${query}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--border);font-size:12px;color:var(--text2);text-decoration:none;background:var(--gray-bg)">🌍 OpenStreetMap</a>`;
  } else {
    html += `<a href="https://www.google.com/maps/search/${query}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--border);font-size:12px;color:var(--text2);text-decoration:none;background:var(--gray-bg)">🗺️ Google Maps</a>`;
    html += `<a href="https://www.openstreetmap.org/search?query=${query}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--border);font-size:12px;color:var(--text2);text-decoration:none;background:var(--gray-bg)">🌍 OpenStreetMap</a>`;
  }
  linksDiv.innerHTML = html;
  linksDiv.style.display = 'flex';
}

function openMapVerify() {
  updateMapLinks();
  const linksDiv = document.getElementById('nf-map-links');
  if(linksDiv) linksDiv.style.display = 'flex';
  // Click first link
  const firstLink = linksDiv ? linksDiv.querySelector('a') : null;
  if(firstLink) firstLink.click();
}

function saveNewFactory() {
  const nameHe = document.getElementById('nf-name-he').value.trim();
  const nameEn = document.getElementById('nf-name-en').value.trim();
  const country = document.getElementById('nf-country').value;
  if(!nameHe) { alert('נא להזין שם מפעל בעברית'); document.getElementById('nf-name-he').focus(); return; }
  if(!nameEn) { alert('נא להזין שם מפעל באנגלית'); document.getElementById('nf-name-en').focus(); return; }
  if(!country) { alert('נא לבחור מדינה'); document.getElementById('nf-country').focus(); return; }

  const status = document.querySelector('input[name="nf-status"]:checked').value;
  const newId = 'f' + Date.now();
  const newFactory = {
    id: newId,
    importerId: currentImporterId,
    name: nameHe,
    nameEn: nameEn,
    nameLocal: document.getElementById('nf-name-local').value.trim(),
    brand: document.getElementById('nf-brand').value.trim(),
    shortName: document.getElementById('nf-short').value.trim(),
    nameNotes: document.getElementById('nf-name-notes').value.trim(),
    country: country,
    city: document.getElementById('nf-city').value.trim(),
    address: document.getElementById('nf-address').value.trim(),
    contact: document.getElementById('nf-contact').value.trim(),
    role: document.getElementById('nf-role').value.trim(),
    phone: document.getElementById('nf-phone').value.trim(),
    email: document.getElementById('nf-email').value.trim(),
    status: status,
    notes: document.getElementById('nf-notes').value.trim(),
    products: []
  };

  // Add to DB
  DB.factories[newId] = newFactory;
  if(currentImporterId && DB.importers[currentImporterId]) {
    DB.importers[currentImporterId].factories.push(newId);
  }

  // Go to new factory file
  openFactory(newId);
}


function openNewProduct() {
  const f = DB.factories[currentFactoryId];
  const imp = currentImporterId ? DB.importers[currentImporterId] : null;
  const sub = document.getElementById('new-prod-factory-sub');
  if(sub) sub.textContent = (f ? f.name : '') + (imp ? ' → ' + imp.name : '');
  // Clear form
  ['np-name','np-client','np-barcode','np-instructions','np-notes'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const cat = document.getElementById('np-category');
  if(cat) cat.value = '';
  const stat = document.getElementById('np-status');
  if(stat) stat.value = 'pending';
  // Pre-fill client from importer name
  const clientEl = document.getElementById('np-client');
  if(clientEl && imp) clientEl.value = imp.name;
  showScreen('s-new-product');
}

function saveNewProduct() {
  const name = document.getElementById('np-name').value.trim();
  const category = document.getElementById('np-category').value;
  if(!name) { alert('נא להזין שם מוצר'); document.getElementById('np-name').focus(); return; }
  if(!category) { alert('נא לבחור קטגוריה'); document.getElementById('np-category').focus(); return; }

  const newId = 'p' + Date.now();
  const today = new Date();
  const dateStr = String(today.getDate()).padStart(2,'0') + '/' + String(today.getMonth()+1).padStart(2,'0') + '/' + today.getFullYear();

  const newProduct = {
    id: newId,
    factoryId: currentFactoryId,
    importerId: currentImporterId,
    name: name,
    barcode: document.getElementById('np-barcode').value.trim(),
    category: category,
    status: document.getElementById('np-status').value,
    instructions: document.getElementById('np-instructions').value.trim(),
    notes: document.getElementById('np-notes').value.trim(),
    updatedAt: dateStr,
    rawMaterials: [],
    certs: [],
    history: [{date: dateStr, user: 'מערכת', action: 'נפתח תיק מוצר'}]
  };

  // Add to DB
  DB.products[newId] = newProduct;
  if(currentFactoryId && DB.factories[currentFactoryId]) {
    DB.factories[currentFactoryId].products.push(newId);
  }

  // Navigate to new product file
  openProduct(newId);
}


// ── Factory report files (stored in memory per session) ──
const factoryReports = {};

function handleFactoryReport(input) {
  if(!input.files || !input.files[0]) return;
  const file = input.files[0];
  const fid = currentFactoryId;
  if(!fid) return;

  if(!factoryReports[fid]) factoryReports[fid] = [];

  const today = new Date();
  const dateStr = String(today.getDate()).padStart(2,'0') + '/' +
                  String(today.getMonth()+1).padStart(2,'0') + '/' +
                  today.getFullYear();
  const timeStr = String(today.getHours()).padStart(2,'0') + ':' +
                  String(today.getMinutes()).padStart(2,'0');

  const report = {
    id: 'r' + Date.now(),
    name: file.name,
    size: formatFileSize(file.size),
    date: dateStr,
    time: timeStr,
    uploadedBy: 'משתמש נוכחי',
    fileObj: file,
    url: URL.createObjectURL(file)
  };

  factoryReports[fid].push(report);
  renderFactoryReports(fid);
  input.value = '';
}

function formatFileSize(bytes) {
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if(['pdf'].includes(ext)) return '📄';
  if(['doc','docx'].includes(ext)) return '📝';
  if(['xls','xlsx'].includes(ext)) return '📊';
  if(['jpg','jpeg','png','webp'].includes(ext)) return '🖼️';
  return '📎';
}

function renderFactoryReports(fid) {
  const list = document.getElementById('fac-report-list');
  const empty = document.getElementById('fac-report-empty');
  const reports = factoryReports[fid] || [];

  if(reports.length === 0) {
    if(empty) empty.style.display = 'block';
    if(list) list.style.display = 'none';
    return;
  }

  if(empty) empty.style.display = 'none';
  if(list) {
    list.style.display = 'flex';
    list.innerHTML = reports.map(r => `
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:0.5px solid var(--border);border-radius:var(--rs);padding:12px 16px">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          <span style="font-size:28px;flex-shrink:0">${getFileIcon(r.name)}</span>
          <div style="min-width:0">
            <div style="font-size:13px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.name}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px">
              ${r.size} · הועלה ${r.date} ${r.time} · על ידי ${r.uploadedBy}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;margin-right:12px">
          <a href="${r.url}" target="_blank" style="padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--border);background:var(--gray-bg);color:var(--text2);font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:4px">👁 צפייה</a>
          <button onclick="deleteFactoryReport('${r.id}','${fid}')" style="padding:5px 12px;border-radius:var(--rs);border:0.5px solid var(--red-b);background:var(--red-bg);color:var(--red-t);font-size:12px;cursor:pointer;font-family:inherit">🗑 מחק</button>
        </div>
      </div>
    `).join('');
  }
}

function deleteFactoryReport(rid, fid) {
  if(!confirm('למחוק את הדוח?')) return;
  if(factoryReports[fid]) {
    const r = factoryReports[fid].find(x=>x.id===rid);
    if(r && r.url) URL.revokeObjectURL(r.url);
    factoryReports[fid] = factoryReports[fid].filter(x=>x.id!==rid);
    renderFactoryReports(fid);
  }
}


const factoryExtraContacts = {};

function addContact() {
  const fid = currentFactoryId;
  if(!factoryExtraContacts[fid]) factoryExtraContacts[fid] = [];
  const name = prompt('שם איש הקשר:');
  if(!name) return;
  const role = prompt('תפקיד:') || '';
  const phone = prompt('טלפון:') || '';
  const email = prompt('אימייל:') || '';
  factoryExtraContacts[fid].push({id:'c'+Date.now(), name, role, phone, email});
  renderExtraContacts(fid);
}

function renderExtraContacts(fid) {
  const list = document.getElementById('fac-extra-contacts');
  if(!list) return;
  const contacts = factoryExtraContacts[fid] || [];
  if(contacts.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = contacts.map(c => `
    <div class="card" style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--gray-bg);color:var(--text2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${c.name.charAt(0)}</div>
          <div>
            <div style="font-size:13px;font-weight:500">${c.name}</div>
            <div style="font-size:11px;color:var(--text3)">${c.role}</div>
          </div>
        </div>
        <button onclick="removeContact('${c.id}','${fid}')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:16px;padding:0">✕</button>
      </div>
      <div style="font-size:12px;color:var(--text2);display:flex;gap:16px">
        ${c.phone ? '<span dir="ltr">📞 '+c.phone+'</span>' : ''}
        ${c.email ? '<span dir="ltr">✉ '+c.email+'</span>' : ''}
      </div>
    </div>`).join('');
}

function removeContact(cid, fid) {
  if(factoryExtraContacts[fid]) {
    factoryExtraContacts[fid] = factoryExtraContacts[fid].filter(c=>c.id!==cid);
    renderExtraContacts(fid);
  }
}

function updateFactoryAddressTab(f) {
  const country = f.country||'';
  const city = f.city||'';
  const address = f.address||'';
  const setEl = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val||'—'; };
  setEl('fac-addr-country', country);
  setEl('fac-addr-city', city);
  setEl('fac-addr-street', address);
  const query = encodeURIComponent([address,city,country].filter(Boolean).join(', '));
  const isChinese = country === 'סין';
  const google = document.getElementById('fac-addr-google');
  const osm = document.getElementById('fac-addr-osm');
  const baidu = document.getElementById('fac-addr-baidu');
  if(google) { google.href='https://www.google.com/maps/search/'+query; google.style.display=isChinese?'none':'inline-flex'; }
  if(osm) { osm.href='https://www.openstreetmap.org/search?query='+query; }
  if(baidu) { baidu.href='https://map.baidu.com/search/'+query; baidu.style.display=isChinese?'inline-flex':'none'; }
  // Update contact display
  const avatar = document.getElementById('fac-contact-avatar');
  if(avatar) avatar.textContent = f.contact ? f.contact.charAt(0) : '?';
  setEl('fac-contact-name-disp', f.contact);
  setEl('fac-contact-phone-disp', f.phone);
  setEl('fac-contact-email-disp', f.email);
  renderExtraContacts(f.id);
}


// ══ RAW MATERIALS MODULE ══
const factoryRawMaterials = {};
let rmEditFiles = [];

const RM_STATUS_MAP = {
  approved: ['b-green','מאושר'],
  pending:  ['b-amber','בבדיקה'],
  missing:  ['b-red','חסר מסמכים'],
  rejected: ['b-red','לא מאושר'],
  expired:  ['b-red','פג תוקף']
};

// סטטוס חומר גלם
const RM_ITEM_STATUS_MAP = {
  approved: {cls:'b-green',  lbl:'מאושר',           dot:'🟢'},
  pending:  {cls:'b-amber',  lbl:'ממתין לבדיקה',    dot:'🟡'},
  rejected: {cls:'b-red',    lbl:'לא מאושר',         dot:'🔴'},
  blocked:  {cls:'',         lbl:'חסום לשימוש',      dot:'⚫', style:'background:#2c2c2a;color:#fff'}
};

// תעודת כשרות
const RM_CERT_STATUS_MAP = {
  exists:     {cls:'b-green',  lbl:'קיימת תעודה',        dot:'🟢'},
  not_needed: {cls:'b-amber',  lbl:'אין צורך בתעודה',    dot:'🟡'},
  missing:    {cls:'',         lbl:'חסרה תעודה',          dot:'🟠', style:'background:#FAEEDA;color:#854F0B'},
  expired:    {cls:'b-red',    lbl:'פג תוקף',             dot:'🔴'}
};

function rmItemStatusBadge(s) {
  const m = RM_ITEM_STATUS_MAP[s]||RM_ITEM_STATUS_MAP.pending;
  const st = m.style ? ` style="${m.style}"` : '';
  return `<span class="badge ${m.cls}"${st} style="font-size:10px${m.style?';'+m.style:''}">${m.dot} ${m.lbl}</span>`;
}

function rmCertStatusBadge(s) {
  const m = RM_CERT_STATUS_MAP[s]||RM_CERT_STATUS_MAP.missing;
  return `<span class="badge ${m.cls}" style="font-size:10px${m.style?';'+m.style:''}">${m.dot} ${m.lbl}</span>`;
}

function openRMForm(editId) {
  rmEditFiles = [];
  const modal = document.getElementById('rm-modal');
  if(!modal) return;

  if(editId) {
    const fid = currentFactoryId;
    const rm = (factoryRawMaterials[fid]||[]).find(r=>r.id===editId);
    if(!rm) return;
    document.getElementById('rm-modal-title').textContent = 'עריכת חומר גלם';
    document.getElementById('rm-edit-id').value = editId;
    document.getElementById('rm-f-name').value = rm.name||'';
    document.getElementById('rm-f-name-en').value = rm.nameEn||'';
    document.getElementById('rm-f-supplier').value = rm.supplier||'';
    document.getElementById('rm-f-manufacturer').value = rm.manufacturer||'';
    document.getElementById('rm-f-origin').value = rm.origin||'';
    document.getElementById('rm-f-category').value = rm.category||'';
    document.getElementById('rm-f-status').value = rm.status||'pending';
    document.getElementById('rm-f-item-status').value = rm.itemStatus||'pending';
    document.getElementById('rm-f-cert-status').value = rm.certStatus||'missing';
    document.getElementById('rm-f-authority').value = rm.authority||'';
    document.getElementById('rm-f-expiry').value = rm.expiry||'';
    document.getElementById('rm-f-notes').value = rm.notes||'';
    const pesachEl = document.querySelector('input[name="rm-pesach"][value="'+(rm.pesach||'no')+'"]');
    if(pesachEl) pesachEl.checked = true;
    rmEditFiles = rm.files ? [...rm.files] : [];
  } else {
    document.getElementById('rm-modal-title').textContent = 'הוספת חומר גלם';
    document.getElementById('rm-edit-id').value = '';
    ['rm-f-name','rm-f-name-en','rm-f-supplier','rm-f-manufacturer','rm-f-origin','rm-f-expiry','rm-f-notes','rm-f-authority'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    document.getElementById('rm-f-category').value='';
    document.getElementById('rm-f-status').value='pending';
    document.getElementById('rm-f-item-status').value='pending';
    document.getElementById('rm-f-cert-status').value='missing';
    const noPesach=document.querySelector('input[name="rm-pesach"][value="no"]');
    if(noPesach) noPesach.checked=true;
  }
  renderRMFilesPreview();
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeRMForm() {
  const modal = document.getElementById('rm-modal');
  if(modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function handleRMFiles(input) {
  Array.from(input.files).forEach(file => {
    rmEditFiles.push({
      id: 'f'+Date.now()+Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      url: URL.createObjectURL(file)
    });
  });
  renderRMFilesPreview();
  input.value='';
}

function renderRMFilesPreview() {
  const el = document.getElementById('rm-files-preview');
  if(!el) return;
  if(rmEditFiles.length===0){el.innerHTML='';return;}
  el.innerHTML = rmEditFiles.map(f=>`
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--gray-bg);border-radius:var(--rs);padding:6px 10px;font-size:12px">
      <span>📎 ${f.name} <span style="color:var(--text3)">(${f.size})</span></span>
      <button onclick="removeRMFile('${f.id}')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:14px;padding:0">✕</button>
    </div>`).join('');
}

function removeRMFile(fid) {
  rmEditFiles = rmEditFiles.filter(f=>f.id!==fid);
  renderRMFilesPreview();
}

function saveRM() {
  const name = document.getElementById('rm-f-name').value.trim();
  if(!name){alert('נא להזין שם חומר גלם');document.getElementById('rm-f-name').focus();return;}
  const fid = currentFactoryId;
  if(!factoryRawMaterials[fid]) factoryRawMaterials[fid]=[];

  const editId = document.getElementById('rm-edit-id').value;
  const pesach = document.querySelector('input[name="rm-pesach"]:checked');

  const rmData = {
    id: editId || 'rm'+Date.now(),
    num: 0,
    name,
    nameEn: document.getElementById('rm-f-name-en').value.trim(),
    supplier: document.getElementById('rm-f-supplier').value.trim(),
    manufacturer: document.getElementById('rm-f-manufacturer').value.trim(),
    origin: document.getElementById('rm-f-origin').value.trim(),
    category: document.getElementById('rm-f-category').value,
    status: document.getElementById('rm-f-status').value,
    itemStatus: document.getElementById('rm-f-item-status').value,
    certStatus: document.getElementById('rm-f-cert-status').value,
    authority: document.getElementById('rm-f-authority').value.trim(),
    expiry: document.getElementById('rm-f-expiry').value.trim(),
    pesach: pesach ? pesach.value : 'no',
    notes: document.getElementById('rm-f-notes').value.trim(),
    files: [...rmEditFiles]
  };

  if(editId) {
    const idx = factoryRawMaterials[fid].findIndex(r=>r.id===editId);
    if(idx>=0){rmData.num=factoryRawMaterials[fid][idx].num; factoryRawMaterials[fid][idx]=rmData;}
  } else {
    rmData.num = factoryRawMaterials[fid].length+1;
    factoryRawMaterials[fid].push(rmData);
  }

  renderRMTable(fid);
  closeRMForm();
}

function deleteRM(rmId) {
  if(!confirm('למחוק חומר גלם זה?')) return;
  const fid = currentFactoryId;
  if(factoryRawMaterials[fid]) {
    factoryRawMaterials[fid] = factoryRawMaterials[fid].filter(r=>r.id!==rmId);
    // Re-number
    factoryRawMaterials[fid].forEach((r,i)=>r.num=i+1);
    renderRMTable(fid);
  }
}

function filterRM() {
  renderRMTable(currentFactoryId);
}

function clearRMFilters() {
  ['rm-search','rm-filter-status','rm-filter-category','rm-filter-item-status','rm-filter-cert-status','rm-filter-pesach'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(el.tagName==='INPUT') el.value='';
    else el.selectedIndex=0;
  });
  renderRMTable(currentFactoryId);
}

function renderRMTable(fid) {
  const tbody = document.getElementById('rm-tbody');
  const emptyRow = document.getElementById('rm-empty-row');
  const countBadge = document.getElementById('rm-count-badge');
  if(!tbody) return;

  const all = factoryRawMaterials[fid]||[];
  const search = (document.getElementById('rm-search')||{}).value||'';
  const stFilter = (document.getElementById('rm-filter-status')||{}).value||'';
  const catFilter = (document.getElementById('rm-filter-category')||{}).value||'';
  const pesachFilter = (document.getElementById('rm-filter-pesach')||{}).value||'';

  const filtered = all.filter(rm=>{
    if(search && !rm.name.includes(search) && !(rm.nameEn||'').toLowerCase().includes(search.toLowerCase()) && !(rm.supplier||'').includes(search) && !(rm.manufacturer||'').includes(search)) return false;
    if(stFilter && rm.status!==stFilter) return false;
    if(catFilter && rm.category!==catFilter) return false;
    if(pesachFilter && rm.pesach!==pesachFilter) return false;
    const itemStFilter=(document.getElementById('rm-filter-item-status')||{}).value||'';
    const certStFilter=(document.getElementById('rm-filter-cert-status')||{}).value||'';
    if(itemStFilter && (rm.itemStatus||'pending')!==itemStFilter) return false;
    if(certStFilter && (rm.certStatus||'missing')!==certStFilter) return false;
    return true;
  });

  if(countBadge) countBadge.textContent = all.length + ' פריטים' + (filtered.length!==all.length ? ' ('+filtered.length+' מסוננים)' : '');

  // Remove old rows (keep empty row)
  Array.from(tbody.querySelectorAll('tr:not(#rm-empty-row)')).forEach(r=>r.remove());

  if(filtered.length===0) {
    if(emptyRow) emptyRow.style.display='';
    return;
  }
  if(emptyRow) emptyRow.style.display='none';

  const today = new Date();
  filtered.forEach(rm=>{
    const [cls,lbl] = RM_STATUS_MAP[rm.status]||['b-gray','—'];
    // Check expiry warning
    let expiryDisplay = rm.expiry||'—';
    let expiryStyle = '';
    if(rm.expiry) {
      const parts = rm.expiry.split('/');
      if(parts.length===3) {
        const expDate = new Date(parts[2],parts[1]-1,parts[0]);
        const diffDays = Math.ceil((expDate-today)/(1000*60*60*24));
        if(diffDays<0) expiryStyle='color:var(--red-t);font-weight:500';
        else if(diffDays<=30) expiryStyle='color:var(--amber-t);font-weight:500';
      }
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:12px;color:var(--text3)">${rm.num}</td>
      <td style="font-weight:500">${rm.name}</td>
      <td style="font-size:12px;color:var(--text3)" dir="ltr">${rm.nameEn||'—'}</td>
      <td>${rm.supplier||'—'}</td>
      <td>${rm.manufacturer||'—'}</td>
      <td>${rm.origin||'—'}</td>
      <td style="font-size:12px">${rm.category||'—'}</td>
      <td><span class="badge ${cls}" style="font-size:10px">${lbl}</span></td>
      <td>${rmItemStatusBadge(rm.itemStatus||'pending')}</td>
      <td>${rmCertStatusBadge(rm.certStatus||'missing')}</td>
      <td style="font-size:12px">${rm.authority||'—'}</td>
      <td style="font-size:12px;${expiryStyle}">${expiryDisplay}</td>
      <td style="text-align:center">${rm.pesach==='yes'?'<span class="badge b-amber" style="font-size:10px">✓ כן</span>':'<span style="font-size:12px;color:var(--text3)">לא</span>'}</td>
      <td style="font-size:12px;color:var(--blue)">${rm.files&&rm.files.length>0?'📎 '+rm.files.length:''}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button onclick="openRMForm('${rm.id}')" class="tbl-btn" title="עריכה">✏️</button>
          <button onclick="deleteRM('${rm.id}')" class="tbl-btn" style="color:var(--red-t)" title="מחיקה">🗑</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function exportRMtoExcel() {
  const fid = currentFactoryId;
  const rms = factoryRawMaterials[fid]||[];
  if(rms.length===0){alert('אין חומרי גלם לייצוא');return;}
  const headers = ['#','שם','שם באנגלית','ספק','יצרן','מדינת מקור','קטגוריה','סטטוס כשרות','סטטוס חומר גלם','תעודת כשרות','גוף כשרות','תוקף','דורש פסח','הערות'];
  const rows = rms.map(rm=>[rm.num,rm.name,rm.nameEn,rm.supplier,rm.manufacturer,rm.origin,rm.category,rm.status,(RM_ITEM_STATUS_MAP[rm.itemStatus]||{}).lbl||'—',(RM_CERT_STATUS_MAP[rm.certStatus]||{}).lbl||'—',rm.authority,rm.expiry,rm.pesach==='yes'?'כן':'לא',rm.notes]);
  const csvContent = [headers,...rows].map(r=>r.map(c=>(c||'').toString().replace(/,/g,';')).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csvContent],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const f = DB.factories[fid];
  a.href=url; a.download=(f?f.name:'rawmat')+'_חומרי_גלם.csv';
  a.click(); URL.revokeObjectURL(url);
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('rm-modal');
  if(modal && e.target===modal) closeRMForm();
});


const MASHGICHIM_DB = {
  msh1: {
    id:'msh1', name:'יוסף לוי', nameEn:'Yosef Levi', code:'MSH-00142',
    avail:'avail', projects:2, countries:18,
    certs:['בישול/אפייה','חלב ישראל','ייצור מיוחד'],
    langs:['עברית','English','Français'],
    citizenships:['🇮🇱 ישראל','🇺🇸 ארה״ב'],
    activeCountries:['🇮🇱 ישראל','🇺🇸 ארה״ב','🇬🇧 בריטניה','🇫🇷 צרפת','🇩🇪 גרמניה'],
    phone:'050-1234567', email:'yosef.levi@email.com',
    notes:'משגיח בכיר עם ניסיון רב. מומחה בייצור מיוחד ומפעלים מורכבים.',
    tz:'Asia/Jerusalem',
    assignments:['proj_demo_1','proj_demo_2']
  },
  msh2: {
    id:'msh2', name:'משה כהן', nameEn:'Moshe Cohen', code:'MSH-00098',
    avail:'prefer', projects:1, countries:7,
    certs:['בישול/אפייה','חלב ישראל','בדיקת חרקים'],
    langs:['עברית','English'],
    citizenships:['🇮🇱 ישראל'],
    activeCountries:['🇮🇱 ישראל','🇬🇧 בריטניה','🇧🇪 בלגיה'],
    phone:'052-9876543', email:'moshe.cohen@email.com',
    notes:'מומחה בבדיקת חרקים וירקות.',
    tz:'Asia/Jerusalem',
    assignments:['proj_demo_2']
  },
  msh3: {
    id:'msh3', name:'דוד ישראלי', nameEn:'David Israeli', code:'MSH-00201',
    avail:'avail', projects:3, countries:24,
    certs:['בישול/אפייה','חלב ישראל','בדיקת חרקים','ביקור ראשוני','ייצור מיוחד'],
    langs:['עברית','English','Español','Русский'],
    citizenships:['🇮🇱 ישראל','🇷🇺 רוסיה'],
    activeCountries:['🇮🇱 ישראל','🇺🇸 ארה״ב','🇷🇺 רוסיה','🇩🇪 גרמניה','🇫🇷 צרפת','🇦🇷 ארגנטינה'],
    phone:'054-3456789', email:'david.israeli@email.com',
    notes:'פעיל במדינות דוברות ספרדית ורוסית. ניסיון בינלאומי רב.'
  }
};

function openMashProfile(mid) {
  const m = MASHGICHIM_DB[mid];
  if(!m) return;

  // Avatar initials
  const initials = m.name.split(' ').map(w=>w[0]).join('').substring(0,2);
  const avatar = document.getElementById('mp-avatar');
  if(avatar) avatar.textContent = initials;

  // Basic info
  const setEl = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val||'—'; };
  const setHtml = (id,val) => { const el=document.getElementById(id); if(el) el.innerHTML=val||''; };

  setEl('mp-name', m.name);
  setEl('mp-name-en', m.nameEn);
  setEl('mp-code', m.code);
  setEl('mp-phone', m.phone);
  setEl('mp-email', m.email);
  setEl('mp-notes', m.notes);
  setEl('mp-countries', m.countries);
  setEl('mp-projects', m.projects);
  setEl('mp-certs-count', m.certs.length);
  setEl('mp-langs-count', m.langs.length);

  // Availability badge
  const availMap = {
    avail: '<span class="badge b-green">זמין</span>',
    prefer: '<span class="badge b-amber">עדיף שלא</span>',
    unavail: '<span class="badge b-red">לא זמין</span>'
  };
  setHtml('mp-avail-badge', availMap[m.avail]||'');

  // Languages
  setHtml('mp-langs', m.langs.map(l=>`<span class="badge b-blue" style="font-size:11px;padding:3px 10px">${l}</span>`).join(''));

  // Certifications
  setHtml('mp-certs-list', m.certs.map(c=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="color:var(--green-t);font-size:16px">✓</span>
        <span style="font-size:13px;font-weight:500">${c}</span>
      </div>
      <span class="badge b-green">בתוקף</span>
    </div>`).join(''));

  // Citizenships
  setHtml('mp-citizenships', m.citizenships.map(c=>`
    <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--gray-bg);border-radius:var(--rs);font-size:13px">${c}</div>`).join(''));

  // Active countries
  setHtml('mp-active-countries', m.activeCountries.map(c=>`
    <span class="badge b-green" style="font-size:11px;padding:4px 10px">${c}</span>`).join(''));

  // Reset tabs
  document.querySelectorAll('#s-mash-profile .tab-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.querySelectorAll('#s-mash-profile .tab-pane').forEach((p,i)=>p.classList.toggle('active',i===0));

  showScreen('s-mash-profile');
}


function openAddMashgiach() {
  // Reset all steps
  ['add-mash-step1','add-mash-step2','add-mash-step3','add-mash-success'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(el) el.style.display = i===0 ? 'block' : 'none';
  });
  // Reset form
  ['am-name-first','am-name-mid','am-name-last','am-name-en-first','am-name-en-mid','am-name-en-last','am-email','am-phone','am-extra-langs'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.querySelectorAll('.am-cert').forEach(cb=>cb.checked=false);
  document.querySelectorAll('.am-lang-cb').forEach(cb=>{ cb.checked = cb.value==='עברית'; });
  // Reset step indicators
  setStepIndicator(1);
  showScreen('s-add-mash');
}

function setStepIndicator(step) {
  [1,2,3].forEach(n=>{
    const ind = document.getElementById('step-ind-'+n);
    const circle = document.getElementById('step-circle-'+n);
    if(!ind) return;
    const active = n<=step;
    ind.style.color = active ? 'var(--blue)' : 'var(--text3)';
    if(circle) {
      circle.style.background = active ? 'var(--blue)' : 'var(--gray-bg)';
      circle.style.color = active ? '#fff' : 'var(--text3)';
    }
  });
}

function addMashStep2() {
  const first = document.getElementById('am-name-first').value.trim();
  const last = document.getElementById('am-name-last').value.trim();
  const email = document.getElementById('am-email').value.trim();
  if(!first||!last){alert('נא למלא שם פרטי ושם משפחה');return;}
  if(!email||!email.includes('@')){alert('נא להזין אימייל תקין');return;}
  document.getElementById('add-mash-step1').style.display='none';
  document.getElementById('add-mash-step2').style.display='block';
  setStepIndicator(2);
}

function addMashBack1() {
  document.getElementById('add-mash-step2').style.display='none';
  document.getElementById('add-mash-step1').style.display='block';
  setStepIndicator(1);
}

function addMashStep3() {
  // Build summary
  const first = document.getElementById('am-name-first').value.trim();
  const last = document.getElementById('am-name-last').value.trim();
  const email = document.getElementById('am-email').value.trim();
  const phone = document.getElementById('am-phone').value.trim();
  const certs = Array.from(document.querySelectorAll('.am-cert:checked')).map(c=>{
    const certMap={bishul:'בישול/אפייה',chalav:'חלב ישראל',tolaim:'בדיקת חרקים',bikur:'ביקור ראשוני',yitzur:'ייצור מיוחד',murkav:'מפעלים מורכבים'};
    return certMap[c.value]||c.value;
  });
  const langs = Array.from(document.querySelectorAll('.am-lang-cb:checked')).map(c=>c.value);

  const summaryEl = document.getElementById('am-summary');
  if(summaryEl) summaryEl.innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px">
      <span style="color:var(--text3)">שם:</span><span style="font-weight:500">${first} ${last}</span>
      <span style="color:var(--text3)">אימייל:</span><span dir="ltr">${email}</span>
      ${phone?`<span style="color:var(--text3)">טלפון:</span><span dir="ltr">${phone}</span>`:''}
      <span style="color:var(--text3)">הסמכות:</span><span>${certs.length>0?certs.join(', '):'ללא'}</span>
      <span style="color:var(--text3)">שפות:</span><span>${langs.join(', ')}</span>
    </div>`;

  // Update send method previews
  const ep=document.getElementById('am-email-preview'); if(ep) ep.textContent=email;
  const pp=document.getElementById('am-phone-preview'); if(pp) pp.textContent=phone||'לא הוזן טלפון';

  document.getElementById('add-mash-step2').style.display='none';
  document.getElementById('add-mash-step3').style.display='block';
  setStepIndicator(3);
}

function addMashBack2() {
  document.getElementById('add-mash-step3').style.display='none';
  document.getElementById('add-mash-step2').style.display='block';
  setStepIndicator(2);
}

function saveMashgiach() {
  const first = document.getElementById('am-name-first').value.trim();
  const last = document.getElementById('am-name-last').value.trim();
  const firstEn = document.getElementById('am-name-en-first').value.trim();
  const lastEn = document.getElementById('am-name-en-last').value.trim();
  const email = document.getElementById('am-email').value.trim();
  const phone = document.getElementById('am-phone').value.trim();
  const method = document.querySelector('input[name="am-send-method"]:checked');
  const sendMethod = method ? method.value : 'none';
  const certs = Array.from(document.querySelectorAll('.am-cert:checked')).map(c=>c.value);
  const langs = Array.from(document.querySelectorAll('.am-lang-cb:checked')).map(c=>c.value);

  // Add to MASHGICHIM_DB
  const newId = 'msh' + Date.now();
  const initials = (first[0]||'') + (last[0]||'');
  MASHGICHIM_DB[newId] = {
    id: newId,
    name: first + ' ' + last,
    nameEn: (firstEn||first) + ' ' + (lastEn||last),
    code: 'MSH-' + String(Object.keys(MASHGICHIM_DB).length + 1).padStart(5,'0'),
    avail: 'pending',
    projects: 0,
    countries: 0,
    certs: certs.map(c=>({bishul:'בישול/אפייה',chalav:'חלב ישראל',tolaim:'בדיקת חרקים',bikur:'ביקור ראשוני',yitzur:'ייצור מיוחד',murkav:'מפעלים מורכבים'}[c]||c)),
    langs,
    citizenships:[],
    activeCountries:[],
    phone,
    email,
    notes:''
  };

  // Success message
  const titleEl = document.getElementById('am-success-title');
  const msgEl = document.getElementById('am-success-msg');
  if(titleEl) titleEl.textContent = first + ' ' + last + ' נוסף בהצלחה!';
  if(msgEl) {
    const methodMsg = {
      email: 'הזמנה נשלחה לאימייל: ' + email,
      whatsapp: 'הזמנה נשלחה בWhatsApp לטלפון: ' + (phone||'—'),
      none: 'המשגיח נוסף לרשימה — ניתן לשלוח הזמנה מאוחר יותר'
    };
    msgEl.textContent = methodMsg[sendMethod]||'';
  }

  document.getElementById('add-mash-step3').style.display='none';
  document.getElementById('add-mash-success').style.display='block';
}


// ══ AVAILABILITY CALENDAR ══
const availData = {}; // key: "YYYY-MM-DD" → "avail"|"prefer"|"unavail"|"none"
let avCurrentMonth = 0; // offset from today's month (0=this month, 1=next, etc.)
let avBrush = 'avail';
let avDragging = false;
const AV_MONTHS = 6;

const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

// ── Hebrew Calendar ──
// Jewish months in Hebrew
const JEWISH_MONTHS_HE = [
  'תשרי','חשוון','כסלו','טבת','שבט','אדר','אדר ב׳',
  'ניסן','אייר','סיוון','תמוז','אב','אלול'
];

// Hebrew letter numerals for days
const HEB_NUMS = {
  1:'א׳',2:'ב׳',3:'ג׳',4:'ד׳',5:'ה׳',6:'ו׳',7:'ז׳',8:'ח׳',9:'ט׳',10:'י׳',
  11:'י״א',12:'י״ב',13:'י״ג',14:'י״ד',15:'ט״ו',16:'ט״ז',17:'י״ז',18:'י״ח',19:'י״ט',20:'כ׳',
  21:'כ״א',22:'כ״ב',23:'כ״ג',24:'כ״ד',25:'כ״ה',26:'כ״ו',27:'כ״ז',28:'כ״ח',29:'כ״ט',30:'ל׳'
};

// Convert Gregorian to Hebrew date using Meeus algorithm
function toHebrewDate(gYear, gMonth, gDay) {
  // gMonth is 1-based
  // Calculate Julian Day Number
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  let JD = gDay + Math.floor((153*m+2)/5) + 365*y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;

  // Convert JD to Hebrew
  const EPOCH = 347997; // JD of Hebrew epoch (1 Tishri 1 AM)
  const jd = JD - EPOCH;
  
  // Approximate Hebrew year
  let hYear = Math.floor(jd / 365.25) + 1;
  while(hebrewYearStart(hYear+1) <= JD) hYear++;
  
  const yearStart = hebrewYearStart(hYear);
  const daysInYear = hebrewYearStart(hYear+1) - yearStart;
  
  // Determine month lengths for this year
  const months = hebrewMonthLengths(hYear, daysInYear);
  
  let dayOfYear = JD - yearStart;
  let hMonth = 0;
  for(let i=0; i<months.length; i++) {
    if(dayOfYear < months[i]) { hMonth = i; break; }
    dayOfYear -= months[i];
  }
  const hDay = dayOfYear + 1;
  
  const monthNames = ['תשרי','חשוון','כסלו','טבת','שבט',
    isLeapYear(hYear)?'אדר א׳':'אדר',
    isLeapYear(hYear)?'אדר ב׳':null,
    'ניסן','אייר','סיוון','תמוז','אב','אלול'].filter(Boolean);
  
  return { day: hDay, month: hMonth, monthName: monthNames[hMonth]||'', year: hYear };
}

function hebrewYearStart(year) {
  // Molad of Tishri
  const months = Math.floor((235*year - 234) / 19);
  const parts = 12084 + 13753*months;
  let day = months*29 + Math.floor(parts/25920);
  const p = parts % 25920;
  
  // Postponement rules (Dehiyyot)
  if((day%7 === 0 && p >= 11416) ||
     (day%7 === 3 && p >= 19440) ||
     (day%7 === 2 && p >= 9924 && !isLeapYear(year-1))) {
    day++;
  }
  if(day%7 === 1 || day%7 === 4 || day%7 === 6) day++;
  
  return day + 347997; // Convert to JD
}

function isLeapYear(year) {
  return (7*year + 1) % 19 < 7;
}

function hebrewMonthLengths(year, daysInYear) {
  const leap = isLeapYear(year);
  // Base month lengths
  let months = [30,29,30,29,30,29,30,29,30,29,30,29];
  if(leap) months.splice(5,0,30); // Add Adar I (30 days) before Adar II
  
  // Adjust Cheshvan and Kislev based on year length
  const base = leap ? 383 : 354;
  if(daysInYear === base+1) months[1] = 30; // Cheshvan gets 30
  if(daysInYear === base-1) months[2] = 29; // Kislev gets 29
  
  return months;
}

function hebrewYearStr(year) {
  // Convert Hebrew year to Hebrew letters (גימטריה)
  const thousands = Math.floor(year / 1000);
  const rem = year % 1000;
  const hundreds = Math.floor(rem / 100);
  const tens = Math.floor((rem % 100) / 10);
  const ones = rem % 10;
  
  const H = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  const T = ['','י','כ','ל','מ','נ','ס','ע','פ','צ'];
  const C = ['','ק','ר','ש','ת','תק','תר','תש','תת','תתק'];
  
  let str = '';
  if(hundreds > 0) str += C[hundreds];
  if(tens === 1 && ones === 5) str += 'ט״ו';
  else if(tens === 1 && ones === 6) str += 'ט״ז';
  else {
    if(tens > 0) str += T[tens];
    if(ones > 0) str += H[ones];
  }
  // Add gershayim before last letter
  if(str.length > 1) str = str.slice(0,-1) + '״' + str.slice(-1);
  else if(str.length === 1) str = str + '׳';
  return 'תשפ״' + str.slice(-1); // Simplified - just use last chars
}

function formatHebrewDate(hDate) {
  const dayStr = HEB_NUMS[hDate.day] || String(hDate.day);
  return dayStr + ' ' + hDate.monthName;
}

function avInit() {
  const today = new Date();
  avCurrentMonth = 0;
  buildMonthTabs(today);
  renderAvCalendar();
}

function buildMonthTabs(today) {
  const tabs = document.getElementById('av-month-tabs');
  if(!tabs) return;
  tabs.innerHTML = '';
  for(let i=0; i<AV_MONTHS; i++) {
    const d = new Date(today.getFullYear(), today.getMonth()+i, 1);
    const btn = document.createElement('button');
    btn.className = 'av-month-tab' + (i===0?' active':'');
    const hDate = toHebrewDate(d.getFullYear(), d.getMonth()+1, 1);
    const gregStr = HEB_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    const hebMon = hDate.monthName;
    btn.innerHTML = '<span>' + gregStr + '</span><br><span style="font-size:10px;opacity:.75">' + hebMon + '</span>';
    btn.setAttribute('data-offset', i);
    btn.onclick = function() {
      avCurrentMonth = parseInt(this.getAttribute('data-offset'));
      document.querySelectorAll('.av-month-tab').forEach(t=>t.classList.remove('active'));
      this.classList.add('active');
      renderAvCalendar();
    };
    tabs.appendChild(btn);
  }
}

function renderAvCalendar() {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + avCurrentMonth, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // Title
  const titleEl = document.getElementById('av-month-title');
  const hebEl = document.getElementById('av-month-heb');
  const hDateStart = toHebrewDate(year, month+1, 1);
  const hDateEnd = toHebrewDate(year, month+1, daysInMonth);
  if(titleEl) titleEl.textContent = HEB_MONTHS[month] + ' ' + year;
  // Show Hebrew month range
  let hebRange = hDateStart.monthName;
  if(hDateEnd.monthName !== hDateStart.monthName) hebRange += ' – ' + hDateEnd.monthName;
  if(hebEl) hebEl.textContent = hebRange + ' ' + hebrewYearStr(hDateStart.year);

  // Nav buttons
  const prevBtn = document.getElementById('av-prev');
  const nextBtn = document.getElementById('av-next');
  if(prevBtn) prevBtn.disabled = avCurrentMonth <= 0;
  if(nextBtn) nextBtn.disabled = avCurrentMonth >= AV_MONTHS-1;
  if(prevBtn) prevBtn.style.opacity = avCurrentMonth<=0 ? '.35' : '1';
  if(nextBtn) nextBtn.style.opacity = avCurrentMonth>=AV_MONTHS-1 ? '.35' : '1';

  // Day of week: Sunday=0. Hebrew week starts Sunday
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  
  const grid = document.getElementById('av-grid');
  if(!grid) return;
  grid.innerHTML = '';

  // Empty cells before first day
  for(let i=0; i<firstDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'av-day empty';
    grid.appendChild(empty);
  }

  // Day cells
  const todayStr = fmtDate(today);
  let cntAvail=0, cntPrefer=0, cntUnavail=0, cntClear=0;

  for(let d=1; d<=daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const key = fmtDate(dateObj);
    const state = availData[key] || 'none';
    const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = key === todayStr;

    if(state==='avail') cntAvail++;
    else if(state==='prefer') cntPrefer++;
    else if(state==='unavail') cntUnavail++;
    else cntClear++;

    const cell = document.createElement('div');
    cell.className = 'av-day ' + state + (isPast?' past':'') + (isToday?' today':'');
    const hD = toHebrewDate(year, month+1, d);
    const hebDayStr = HEB_NUMS[hD.day] || String(hD.day);
    // Show Hebrew month start indicator
    const isHebMonthStart = hD.day === 1;
    cell.innerHTML = '<span class="dg">' + d + '</span><span style="font-size:9px;line-height:1;color:inherit;opacity:.7">' + hebDayStr + (isHebMonthStart ? ' ' + hD.monthName.slice(0,3) : '') + '</span>';
    cell.setAttribute('data-key', key);
    cell.setAttribute('data-past', isPast?'1':'0');

    if(!isPast) {
      cell.onmousedown = function(e) {
        e.preventDefault();
        avDragging = true;
        applyBrush(this.getAttribute('data-key'));
      };
      cell.onmouseenter = function() {
        if(avDragging) applyBrush(this.getAttribute('data-key'));
      };
      cell.onclick = function() {
        applyBrush(this.getAttribute('data-key'));
      };
    }
    grid.appendChild(cell);
  }

  // Update summary
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('av-cnt-avail', cntAvail);
  set('av-cnt-prefer', cntPrefer);
  set('av-cnt-unavail', cntUnavail);
  set('av-cnt-clear', cntClear);
}

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function applyBrush(key) {
  if(avBrush==='clear') {
    delete availData[key];
    const cell = document.querySelector('[data-key="'+key+'"]');
    if(cell) { cell.className = cell.className.replace(/avail|prefer|unavail|none/g,'').trim() + ' none'; cell.querySelector('.dg').parentElement.className=cell.className; }
  } else {
    availData[key] = avBrush;
  }
  // Re-render just this cell
  const cell = document.querySelector('[data-key="'+key+'"]');
  if(cell) {
    cell.classList.remove('avail','prefer','unavail','none');
    cell.classList.add(avBrush==='clear'?'none':avBrush);
  }
  updateAvSummary();
}

function updateAvSummary() {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + avCurrentMonth, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  let cntAvail=0, cntPrefer=0, cntUnavail=0, cntClear=0;
  for(let d=1; d<=daysInMonth; d++) {
    const key = fmtDate(new Date(year,month,d));
    const s = availData[key]||'none';
    if(s==='avail') cntAvail++;
    else if(s==='prefer') cntPrefer++;
    else if(s==='unavail') cntUnavail++;
    else cntClear++;
  }
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('av-cnt-avail', cntAvail);
  set('av-cnt-prefer', cntPrefer);
  set('av-cnt-unavail', cntUnavail);
  set('av-cnt-clear', cntClear);
}

function setBrush(b) {
  avBrush = b;
  const brushMap = {avail:'br-avail', prefer:'br-prefer', unavail:'br-unavail', clear:'br-clear'};
  ['br-avail','br-prefer','br-unavail','br-clear'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.style.borderWidth = '0.5px';
  });
  const active = document.getElementById(brushMap[b]);
  if(active) active.style.borderWidth = '2px';
}

function avPrev() {
  if(avCurrentMonth > 0) {
    avCurrentMonth--;
    document.querySelectorAll('.av-month-tab').forEach(t=>{
      t.classList.toggle('active', parseInt(t.getAttribute('data-offset'))===avCurrentMonth);
    });
    renderAvCalendar();
  }
}

function avNext() {
  if(avCurrentMonth < AV_MONTHS-1) {
    avCurrentMonth++;
    document.querySelectorAll('.av-month-tab').forEach(t=>{
      t.classList.toggle('active', parseInt(t.getAttribute('data-offset'))===avCurrentMonth);
    });
    renderAvCalendar();
  }
}

// Stop drag on mouseup anywhere
document.addEventListener('mouseup', function() { avDragging = false; });

// Init when avail screen opens
const _origShowScreen = showScreen;
showScreen = function(id) {
  _origShowScreen(id);
  if(id === 's-avail') setTimeout(avInit, 0);
};


// ══ SUPERVISION & PROJECTS ══
const PROJECTS_DB = {
  'proj_demo_1': {
    id: 'proj_demo_1',
    number: 1001,
    factoryId: 'f1',
    importerId: 'imp1',
    factoryTz: 'Asia/Shanghai',
    products: ['p1'],
    days: [
      { date:'20/01/2025', timeStart:'09:00', timeEnd:'17:00', mashgichim:[] },
      { date:'21/01/2025', timeStart:'09:00', timeEnd:'17:00', mashgichim:[] },
      { date:'22/01/2025', timeStart:'08:00', timeEnd:'14:00', mashgichim:['msh2'] }
    ],
    mashgichim: ['msh1'],
    status: 'active',
    notes: 'ייצור רוטב עגבניות קלאסי. יש לוודא קו ייצור נפרד מחלבי. ניקוי מלא לפני תחילת הייצור.',
    createdAt: '10/01/2025'
  },
  'proj_demo_2': {
    id: 'proj_demo_2',
    number: 1002,
    factoryId: 'f2',
    importerId: 'imp1',
    factoryTz: 'Asia/Jerusalem',
    products: ['p3'],
    days: [
      { date:'05/02/2025', timeStart:'07:00', timeEnd:'15:00', mashgichim:[] },
      { date:'06/02/2025', timeStart:'07:00', timeEnd:'15:00', mashgichim:[] }
    ],
    mashgichim: ['msh1','msh2'],
    status: 'waiting',
    notes: 'ייצור לחם מלא. שמירה על טמפרטורת אפייה.',
    createdAt: '15/01/2025'
  }
};
let projectCounter = 1002;
const factoryVisits = {};

const PROJECT_STATUSES = {
  draft:    {lbl:'טיוטה',         cls:'b-gray'},
  waiting:  {lbl:'ממתין לאישור',  cls:'b-amber'},
  ready:    {lbl:'מוכן לשיבוץ',   cls:'b-blue'},
  active:   {lbl:'פעיל',          cls:'b-green'},
  done:     {lbl:'הושלם',          cls:'b-green'},
  cancelled:{lbl:'בוטל',           cls:'b-red'}
};

function renderSupervisionList(fid) {
  const factory = DB.factories[fid];
  if(!factory) return;
  const products = factory.products.map(pid=>DB.products[pid]).filter(Boolean);
  const list = document.getElementById('fac-supervision-list');
  if(!list) return;

  if(products.length===0){
    list.innerHTML='<div style="text-align:center;padding:30px;color:var(--text3);font-size:13px">אין מוצרים — הוסף מוצרים תחילה</div>';
    return;
  }
  list.innerHTML = products.map(p=>{
    const sup = p.supervision||'annual';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--gray-bg);border-radius:var(--rs);margin-bottom:6px">
      <div>
        <div style="font-size:13px;font-weight:500">${p.name}</div>
        <div style="font-size:11px;color:var(--text3)">${p.category||''}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="setProductSupervision('${p.id}','annual')" style="padding:5px 12px;border-radius:var(--rs);border:0.5px solid;font-size:12px;cursor:pointer;font-family:inherit;${sup==='annual'?'background:var(--green-bg);color:var(--green-t);border-color:var(--green-b);font-weight:500':'background:none;color:var(--text2);border-color:var(--border)'}">📅 שנתי</button>
        <button onclick="setProductSupervision('${p.id}','close')" style="padding:5px 12px;border-radius:var(--rs);border:0.5px solid;font-size:12px;cursor:pointer;font-family:inherit;${sup==='close'?'background:var(--blue-l);color:var(--blue-d);border-color:var(--blue);font-weight:500':'background:none;color:var(--text2);border-color:var(--border)'}">👁 השגחה צמודה</button>
      </div>
    </div>`;
  }).join('');
  updateSupervisionSummary(fid);
}

function setProductSupervision(pid, type) {
  const p = DB.products[pid]; if(!p) return;
  p.supervision = type;
  renderSupervisionList(currentFactoryId);
  renderProjectsTab(currentFactoryId);
  renderProductsList(currentFactoryId);
}

function updateSupervisionSummary(fid) {
  const factory = DB.factories[fid]; if(!factory) return;
  const products = factory.products.map(pid=>DB.products[pid]).filter(Boolean);
  const allAnnual = products.length>0 && products.every(p=>(p.supervision||'annual')==='annual');
  const closeCount = products.filter(p=>(p.supervision||'annual')==='close').length;
  const annualCount = products.length - closeCount;

  const summary = document.getElementById('fac-supervision-summary');
  const visitsCard = document.getElementById('fac-visits-card');
  const annualMsg = document.getElementById('fac-projects-annual-msg');
  const projContent = document.getElementById('fac-projects-content');

  if(summary) {
    if(products.length===0){summary.innerHTML='';return;}
    if(allAnnual){
      summary.style.cssText='margin-top:12px;padding:10px 14px;border-radius:6px;font-size:13px;background:var(--green-bg)';
      summary.innerHTML='<span style="color:var(--green-t);font-weight:500">✅ כל המוצרים שנתיים — המפעל כולו שנתי</span>';
    } else {
      summary.style.cssText='margin-top:12px;padding:10px 14px;border-radius:6px;font-size:13px;background:var(--blue-l)';
      summary.innerHTML=`<span style="color:var(--blue-d);font-weight:500">${closeCount} מוצרים בהשגחה צמודה${annualCount>0?' · '+annualCount+' שנתיים':''}</span>`;
    }
  }
  if(visitsCard) visitsCard.style.display = allAnnual ? 'block' : 'none';
  if(annualMsg) annualMsg.style.display = allAnnual ? 'block' : 'none';
  if(projContent) projContent.style.display = allAnnual ? 'none' : 'block';
}

function changeVisits(delta){
  const fid=currentFactoryId;
  if(!factoryVisits[fid]) factoryVisits[fid]={required:4,done:0};
  factoryVisits[fid].required=Math.max(1,Math.min(20,factoryVisits[fid].required+delta));
  updateVisitsDisplay(fid);
}

function addVisitDone(){
  const fid=currentFactoryId;
  if(!factoryVisits[fid]) factoryVisits[fid]={required:4,done:0};
  const v=factoryVisits[fid];
  if(v.done<v.required){v.done++;updateVisitsDisplay(fid);}
  else alert('כל הביקורים הנדרשים בוצעו!');
}

function updateVisitsDisplay(fid){
  if(!factoryVisits[fid]) factoryVisits[fid]={required:4,done:0};
  const v=factoryVisits[fid];
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val;};
  set('fac-visits-num',v.required);set('fac-visits-total',v.required);
  set('fac-visits-done',v.done);set('fac-visits-left',Math.max(0,v.required-v.done));
}

function renderProjectsTab(fid){
  updateSupervisionSummary(fid);
  const imp=DB.importers[DB.factories[fid]?.importerId];
  const sub=document.getElementById('fac-projects-sub');
  if(sub&&imp) sub.textContent='עבור '+imp.name;
  const list=document.getElementById('fac-projects-list');
  if(!list) return;
  const projects=Object.values(PROJECTS_DB).filter(p=>p.factoryId===fid&&p.importerId===currentImporterId);
  if(projects.length===0){
    list.innerHTML='<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">אין פרויקטי ייצור — לחץ "פרויקט ייצור חדש"</div>';
    return;
  }
  list.innerHTML=projects.map(proj=>{
    const st=PROJECT_STATUSES[proj.status]||{lbl:'—',cls:'b-gray'};
    const prods=proj.products.map(pid=>DB.products[pid]?.name||'').filter(Boolean).join(' · ');
    return `<div class="list-card" onclick="openProject('${proj.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:13px;font-weight:500">פרויקט #${proj.number} · ${proj.dateStart||'—'}</div>
        <span class="badge ${st.cls}">${st.lbl}</span>
      </div>
      <div style="font-size:12px;color:var(--text3)">${prods}</div>
    </div>`;
  }).join('');
}

function renderProductsList(fid){
  const factory=DB.factories[fid]; if(!factory) return;
  const list=document.getElementById('fac-products-list'); if(!list) return;
  const products=factory.products.map(pid=>DB.products[pid]).filter(Boolean);
  if(products.length===0){
    list.innerHTML='<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">אין מוצרים — לחץ "מוצר חדש"</div>';
    return;
  }
  list.innerHTML=products.map(p=>{
    const sup=(p.supervision||'annual')==='close'
      ?'<span class="badge b-blue" style="font-size:10px">👁 השגחה צמודה</span>'
      :'<span class="badge b-green" style="font-size:10px">📅 שנתי</span>';
    const stMap={approved:'b-green מאושר',pending:'b-amber בבדיקה',missing:'b-red חסר מסמכים',rejected:'b-gray לא מאושר'};
    const parts=(stMap[p.status]||'b-gray —').split(' ');
    return `<button class="list-card" onclick="openProduct('${p.id}')" style="width:100%;text-align:right;font-family:inherit">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="list-card-title">${p.name}</div>
          <div style="font-size:11px;color:var(--text3)">${p.category||''}${p.barcode?' · '+p.barcode:''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">${sup}<span class="badge ${parts[0]}" style="font-size:10px">${parts[1]}</span><span style="color:var(--blue)">←</span></div>
      </div>
    </button>`;
  }).join('');
}

function openNewProject(){
  const fid=currentFactoryId;
  const factory=DB.factories[fid]; if(!factory) return;
  // Show close-supervision products first, fall back to all products
  const closeProds=factory.products.map(pid=>DB.products[pid]).filter(p=>p&&(p.supervision||'annual')==='close');
  const allProds=factory.products.map(pid=>DB.products[pid]).filter(Boolean);
  const prodsToShow = closeProds.length > 0 ? closeProds : allProds;
  if(prodsToShow.length===0){alert('אין מוצרים במפעל זה. הוסף מוצרים תחילה.');return;}
  const imp=DB.importers[currentImporterId];
  const sub=document.getElementById('np-project-sub');
  if(sub) sub.textContent=(factory.name||'')+' → '+(imp?imp.name:'');
  const prodList=document.getElementById('np-proj-products');
  if(prodList) prodList.innerHTML=prodsToShow.map(p=>`
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 12px;background:var(--gray-bg);border-radius:var(--rs);margin-bottom:6px">
      <input type="checkbox" value="${p.id}" class="np-proj-prod-cb" style="accent-color:var(--blue);width:15px;height:15px;flex-shrink:0">
      <div><div style="font-size:13px;font-weight:500">${p.name}</div><div style="font-size:11px;color:var(--text3)">${p.category||''}</div></div>
    </label>`).join('');
  ['np-proj-date-start','np-proj-date-end','np-proj-time-start','np-proj-time-end','np-proj-notes','np-proj-mashgichim'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const st=document.getElementById('np-proj-status'); if(st) st.value='draft';
  showScreen('s-new-project');
}

function saveNewProject(){
  const selected=Array.from(document.querySelectorAll('.np-proj-prod-cb:checked')).map(cb=>cb.value);
  if(selected.length===0){alert('נא לבחור לפחות מוצר אחד');return;}
  const ds=document.getElementById('np-proj-date-start').value.trim();
  if(!ds){alert('נא להזין תאריך התחלה');return;}
  projectCounter++;
  const id='proj'+Date.now();
  PROJECTS_DB[id]={id,number:projectCounter,factoryId:currentFactoryId,importerId:currentImporterId,
    dateStart:ds,dateEnd:(document.getElementById('np-proj-date-end').value||'').trim(),
    timeStart:(document.getElementById('np-proj-time-start').value||'').trim(),
    timeEnd:(document.getElementById('np-proj-time-end').value||'').trim(),
    products:selected,mashgichim:(document.getElementById('np-proj-mashgichim').value||'').trim(),
    status:document.getElementById('np-proj-status').value||'draft',
    notes:(document.getElementById('np-proj-notes').value||'').trim()};
  openFactory(currentFactoryId);
  setTimeout(()=>{const t=document.querySelector('[onclick*="fac-projects"]');if(t)t.click();},150);
}

function openProject(id){
  const p=PROJECTS_DB[id]; if(!p) return;
  const st=PROJECT_STATUSES[p.status]||{lbl:'—'};
  const prods=p.products.map(pid=>DB.products[pid]?.name||'').join(', ');
  alert('פרויקט #'+p.number+'\nסטטוס: '+st.lbl+'\nתאריך: '+p.dateStart+'\nמוצרים: '+prods);
}


// ══ DATEPICKER ══
const dpState = {}; // id → {year, month, selectedDate}
const DP_HEB = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function dpToggle(id) {
  const popup = document.getElementById(id);
  if(!popup) return;
  // Close all other popups
  document.querySelectorAll('.dp-popup').forEach(p => { if(p.id!==id) p.classList.remove('open'); });
  const isOpen = popup.classList.contains('open');
  popup.classList.toggle('open');
  if(!isOpen) {
    // Init state for this picker
    if(!dpState[id]) {
      const today = new Date();
      dpState[id] = { year: today.getFullYear(), month: today.getMonth(), selected: null };
    }
    dpRender(id);
  }
}

function dpPrev(id) {
  if(!dpState[id]) return;
  dpState[id].month--;
  if(dpState[id].month < 0) { dpState[id].month = 11; dpState[id].year--; }
  dpRender(id);
}

function dpNext(id) {
  if(!dpState[id]) return;
  dpState[id].month++;
  if(dpState[id].month > 11) { dpState[id].month = 0; dpState[id].year++; }
  dpRender(id);
}

function dpRender(id) {
  const s = dpState[id]; if(!s) return;
  const { year, month, selected } = s;

  // Title
  const title = document.getElementById(id+'-title');
  const heb = document.getElementById(id+'-heb');
  if(title) title.textContent = DP_HEB[month] + ' ' + year;

  // Hebrew date for 1st of month
  try {
    const h = toHebrewDate(year, month+1, 1);
    if(heb) heb.textContent = h.monthName + ' – ' + (toHebrewDate(year,month+1,new Date(year,month+1,0).getDate()).monthName||h.monthName);
  } catch(e) { if(heb) heb.textContent = ''; }

  const grid = document.getElementById(id+'-grid'); if(!grid) return;
  const today = new Date();
  const todayStr = dpFmt(today);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  let html = '';
  // Empty cells
  for(let i=0;i<firstDow;i++) html += '<div class="dp-day dp-empty"></div>';
  // Days
  for(let d=1;d<=daysInMonth;d++) {
    const key = dpFmt(new Date(year,month,d));
    const isToday = key===todayStr;
    const isSel = selected && selected===key;
    const isPast = new Date(year,month,d) < new Date(today.getFullYear(),today.getMonth(),today.getDate());
    let cls = 'dp-day';
    if(isToday) cls += ' dp-today';
    if(isSel) cls += ' dp-selected';
    if(isPast) cls += ' dp-past';
    // Hebrew day
    let hebDay = '';
    try { const h=toHebrewDate(year,month+1,d); hebDay=HEB_NUMS[h.day]||''; } catch(e){}
    html += `<div class="${cls}" onclick="dpSelect('${id}','${key}',${d})">${d}<span class="dp-hd">${hebDay}</span></div>`;
  }
  grid.innerHTML = html;
}

function dpFmt(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function dpSelect(id, key, day) {
  if(!dpState[id]) return;
  dpState[id].selected = key;

  // Update input field (DD/MM/YYYY format)
  const parts = key.split('-');
  const displayVal = parts[2]+'/'+parts[1]+'/'+parts[0];

  // Find the input — convention: dp-start → np-proj-date-start, dp-end → np-proj-date-end
  const inputMap = {'dp-start':'np-proj-date-start','dp-end':'np-proj-date-end'};
  const inputId = inputMap[id];
  if(inputId) {
    const inp = document.getElementById(inputId);
    if(inp) inp.value = displayVal;
  }

  dpRender(id);
  // Close popup after short delay
  setTimeout(() => {
    const popup = document.getElementById(id);
    if(popup) popup.classList.remove('open');
  }, 200);
}

function dpValidate(input) {
  // Allow manual typing in DD/MM/YYYY format
  input.style.borderColor = '';
}

// Close datepicker on outside click
document.addEventListener('click', function(e) {
  if(!e.target.closest('.dp-wrap')) {
    document.querySelectorAll('.dp-popup').forEach(p=>p.classList.remove('open'));
  }
});


// ══ PROJECT WIZARD STATE ══
let npState = {
  step: 1,
  factoryId: null,
  importerId: null,
  factoryTz: 'Asia/Jerusalem',
  products: [],      // selected product ids
  days: [],          // [{date, timeStart, timeEnd, mashgichim:[]}]
  defaultTimeStart: '09:00',
  defaultTimeEnd: '17:00',
  mashgichim: [],    // default mashgichim for all days
};

const TZ_COUNTRY_MAP = {
  'ישראל':'Asia/Jerusalem','סין':'Asia/Shanghai','ארה״ב':'America/New_York',
  'בריטניה':'Europe/London','צרפת':'Europe/Paris','גרמניה':'Europe/Berlin',
  'הולנד':'Europe/Amsterdam','בלגיה':'Europe/Brussels','שוויץ':'Europe/Zurich',
  'פולין':'Europe/Warsaw','הונגריה':'Europe/Budapest','צ׳כיה':'Europe/Prague',
  'טורקיה':'Europe/Istanbul','יפן':'Asia/Tokyo','קוריאה':'Asia/Seoul',
  'הודו':'Asia/Kolkata','תאילנד':'Asia/Bangkok','וייטנאם':'Asia/Ho_Chi_Minh',
  'אינדונזיה':'Asia/Jakarta','מלזיה':'Asia/Kuala_Lumpur','סינגפור':'Asia/Singapore',
  'אוסטרליה':'Australia/Sydney','קנדה':'America/Toronto','ברזיל':'America/Sao_Paulo',
  'ארגנטינה':'America/Argentina/Buenos_Aires','דרום אפריקה':'Africa/Johannesburg',
  'מקסיקו':'America/Mexico_City'
};

function openNewProject() {
  const fid = currentFactoryId;
  const factory = DB.factories[fid];
  if(!factory) return;
  const products = factory.products.map(pid=>DB.products[pid]).filter(Boolean);
  if(products.length===0){alert('אין מוצרים במפעל זה');return;}

  // Reset state
  npState = {
    step:1, factoryId:fid, importerId:currentImporterId,
    factoryTz: TZ_COUNTRY_MAP[factory.country]||'Asia/Jerusalem',
    products:[], days:[], defaultTimeStart:'09:00', defaultTimeEnd:'17:00', mashgichim:[]
  };

  // Fill factory display
  const facEl = document.getElementById('np-fac-display');
  if(facEl) facEl.value = factory.name + (factory.country?' · '+factory.country:'');

  // Set timezone selector
  const tzEl = document.getElementById('np-factory-tz');
  if(tzEl) { tzEl.value = npState.factoryTz; }
  npUpdateTz();

  // Fill products
  const prodList = document.getElementById('np-proj-products');
  if(prodList) {
    prodList.innerHTML = products.map(p=>{
      const sup = (p.supervision||'annual')==='close'
        ? '<span class="badge b-blue" style="font-size:10px">👁 השגחה צמודה</span>'
        : '<span class="badge b-green" style="font-size:10px">📅 שנתי</span>';
      return `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;background:var(--gray-bg);border-radius:var(--rs);border:1.5px solid transparent" class="prod-select-row" id="prow-${p.id}">
        <input type="checkbox" value="${p.id}" class="np-prod-cb" onchange="npToggleProd('${p.id}',this.checked)" style="accent-color:var(--blue);width:15px;height:15px;flex-shrink:0">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">${p.name}</div>
          <div style="font-size:11px;color:var(--text3)">${p.category||''}</div>
        </div>
        ${sup}
      </label>`;
    }).join('');
  }

  npSetStep(1);
  showScreen('s-new-project');
}

function npToggleProd(pid, checked) {
  if(checked && !npState.products.includes(pid)) npState.products.push(pid);
  else if(!checked) npState.products = npState.products.filter(id=>id!==pid);
  // Visual
  const row = document.getElementById('prow-'+pid);
  if(row) row.style.borderColor = checked ? 'var(--blue)' : 'transparent';
}

function npUpdateTz() {
  const tz = document.getElementById('np-factory-tz')?.value||'Asia/Jerusalem';
  npState.factoryTz = tz;
  const nowEl = document.getElementById('np-tz-now');
  if(nowEl) {
    try {
      const now = new Date();
      const local = now.toLocaleTimeString('he-IL',{timeZone:tz,hour:'2-digit',minute:'2-digit'});
      const offset = getUtcOffsetStr(tz);
      nowEl.textContent = '🕐 שעה נוכחית במפעל: ' + local + '  (' + offset + ')';
    } catch(e){ nowEl.textContent=''; }
  }
}

function getUtcOffsetStr(tz) {
  try {
    const d = new Date();
    const utcStr = d.toLocaleString('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hour12:false});
    const localStr = d.toLocaleString('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false});
    const [uh,um] = utcStr.split(':').map(Number);
    const [lh,lm] = localStr.split(':').map(Number);
    let diff = (lh*60+lm) - (uh*60+um);
    if(diff > 720) diff -= 1440;
    if(diff < -720) diff += 1440;
    const sign = diff>=0?'+':'-';
    const abs = Math.abs(diff);
    return 'UTC'+sign+Math.floor(abs/60)+(abs%60?':'+String(abs%60).padStart(2,'0'):'');
  } catch(e){ return 'UTC'; }
}

function convertTime(timeStr, fromTz, toTz) {
  // Convert "HH:MM" from one timezone to another
  try {
    const [h,m] = timeStr.split(':').map(Number);
    const today = new Date();
    // Create a date at the given time in fromTz
    const dateStr = today.toLocaleDateString('en-CA');
    const dt = new Date(dateStr + 'T' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00');
    // Get UTC equivalent
    const fromOffset = getOffsetMinutes(fromTz);
    const toOffset = getOffsetMinutes(toTz);
    const diffMin = toOffset - fromOffset;
    const totalMin = h*60 + m + diffMin;
    const newH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
    const newM = ((totalMin % 1440) + 1440) % 1440 % 60;
    return String(newH).padStart(2,'0') + ':' + String(newM).padStart(2,'0');
  } catch(e) { return timeStr; }
}

function getOffsetMinutes(tz) {
  const d = new Date();
  const utcStr = d.toLocaleString('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hour12:false});
  const localStr = d.toLocaleString('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false});
  const [uh,um] = utcStr.split(':').map(Number);
  const [lh,lm] = localStr.split(':').map(Number);
  let diff = (lh*60+lm)-(uh*60+um);
  if(diff>720) diff-=1440; if(diff<-720) diff+=1440;
  return diff;
}

function npSetStep(n) {
  npState.step = n;
  [1,2,3,4].forEach(i=>{
    const el = document.getElementById('np-s'+i);
    if(el) el.style.display = i===n?'block':'none';
    const circle = document.getElementById('np-step-'+i+'-circle')||document.getElementById('np-step-'+i)?.querySelector('div');
    const ind = document.getElementById('np-step-'+i);
    if(ind) {
      ind.style.color = i<=n?'var(--blue)':'var(--text3)';
      const c = document.getElementById('np-step-'+i+'-circle');
      if(c) { c.style.background=i<=n?'var(--blue)':'var(--gray-bg)'; c.style.color=i<=n?'#fff':'var(--text3)'; }
    }
  });
}

function npGoStep2() {
  // Step 1 → 2: only validate products selected
  if(npState.products.length===0){alert('נא לבחור לפחות מוצר אחד');return;}
  npSetStep(2);
}

function npBuildDaysAndGoStep3() {
  // Step 2 → 3: validate dates and build days array
  const startVal = document.getElementById('np-date-start')?.value;
  const endVal = document.getElementById('np-date-end')?.value;
  if(!startVal){alert('נא לבחור תאריך התחלה');return;}

  const parseDate = s => { const [d,m,y]=s.split('/'); return new Date(+y,+m-1,+d); };
  const startD = parseDate(startVal);
  const endD = endVal ? parseDate(endVal) : startD;
  if(endD < startD){alert('תאריך סיום לא יכול להיות לפני תאריך ההתחלה');return;}

  // Build days
  npState.days = [];
  let cur = new Date(startD);
  while(cur <= endD) {
    const dd = String(cur.getDate()).padStart(2,'0');
    const mm = String(cur.getMonth()+1).padStart(2,'0');
    const yy = cur.getFullYear();
    npState.days.push({
      date: dd+'/'+mm+'/'+yy,
      timeStart: npState.defaultTimeStart,
      timeEnd: npState.defaultTimeEnd,
      mashgichim: []
    });
    cur.setDate(cur.getDate()+1);
  }
  renderDaysList();
  npGoStep3();
}

function renderDaysList() {
  const list = document.getElementById('np-days-list');
  if(!list) return;
  const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  list.innerHTML = npState.days.map((day,i)=>{
    const [d,m,y] = day.date.split('/');
    const dow = new Date(+y,+m-1,+d).getDay();
    return `<div class="day-row" id="day-row-${i}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--blue-l);color:var(--blue-d);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${d}</div>
          <div>
            <div style="font-size:13px;font-weight:500">יום ${HE_DAYS[dow]} · ${day.date}</div>
            <div style="font-size:11px;color:var(--text3)" id="day-tz-${i}"></div>
          </div>
        </div>
        <div class="tp-wrap">
          <input type="time" value="${day.timeStart}" onchange="npDayTime(${i},'start',this.value)" title="שעת התחלה">
          <span style="font-size:13px;color:var(--text3)">—</span>
          <input type="time" value="${day.timeEnd}" onchange="npDayTime(${i},'end',this.value)" title="שעת סיום">
          <button onclick="npResetDayTime(${i})" style="padding:4px 8px;border-radius:var(--rs);border:0.5px solid var(--border);background:none;font-size:11px;cursor:pointer;color:var(--text3);font-family:inherit" title="איפוס לשעות ברירת מחדל">↺</button>
        </div>
      </div>
    </div>`;
  }).join('');
  // Update TZ display for each day
  npState.days.forEach((_,i) => npUpdateDayTz(i));
}

function npUpdateDayTz(i) {
  const day = npState.days[i];
  if(!day) return;
  const el = document.getElementById('day-tz-'+i);
  if(!el) return;
  try {
    const facStart = day.timeStart;
    const facEnd = day.timeEnd;
    const mashTz = 'Asia/Jerusalem'; // default mashgiach TZ
    const mashStart = convertTime(facStart, npState.factoryTz, mashTz);
    const mashEnd = convertTime(facEnd, npState.factoryTz, mashTz);
    if(npState.factoryTz !== mashTz) {
      el.textContent = '🏭 ' + facStart+'–'+facEnd + ' · 👤 ישראל: ' + mashStart+'–'+mashEnd;
    } else {
      el.textContent = '🏭 ' + facStart+'–'+facEnd;
    }
  } catch(e){}
}

function npDayTime(i, type, val) {
  if(npState.days[i]) {
    if(type==='start') npState.days[i].timeStart = val;
    else npState.days[i].timeEnd = val;
    npUpdateDayTz(i);
  }
}

function npResetDayTime(i) {
  if(npState.days[i]) {
    npState.days[i].timeStart = npState.defaultTimeStart;
    npState.days[i].timeEnd = npState.defaultTimeEnd;
    renderDaysList();
  }
}

function npApplyDefaultTimes() {
  const s = document.getElementById('np-time-default-start')?.value||'09:00';
  const e = document.getElementById('np-time-default-end')?.value||'17:00';
  npState.defaultTimeStart = s;
  npState.defaultTimeEnd = e;
  npState.days.forEach(d=>{ d.timeStart=s; d.timeEnd=e; });
  renderDaysList();
}

function npGoStep3() {
  // Check all days have times
  const badDay = npState.days.find(d=>!d.timeStart||!d.timeEnd);
  if(badDay){alert('נא להגדיר שעות לכל הימים');return;}
  renderMashgichimList();
  renderDaysMashList();
  npSetStep(3);
}

function renderMashgichimList() {
  const list = document.getElementById('np-mash-list');
  if(!list) return;
  const mashgichim = Object.values(MASHGICHIM_DB);
  list.innerHTML = mashgichim.map(m=>{
    const initials = m.name.split(' ').map(w=>w[0]).join('').substring(0,2);
    const avMap = {avail:'🟢',prefer:'🟡',unavail:'🔴',pending:'⚪'};
    const isSelected = npState.mashgichim.includes(m.id);
    return `<div class="mash-card ${isSelected?'selected':''}" id="mcard-${m.id}" onclick="npToggleMash('${m.id}')">
      <div class="mash-avatar">${initials}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${m.name}</div>
        <div style="font-size:11px;color:var(--text3)">${m.nameEn} · ${m.code}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${(m.certs||[]).slice(0,2).join(' · ')}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:16px">${avMap[m.avail]||'⚪'}</div>
        <div style="font-size:10px;color:var(--text3)">${{avail:'זמין',prefer:'עדיף שלא',unavail:'לא זמין',pending:'ממתין'}[m.avail]||''}</div>
      </div>
      ${isSelected?'<div style="color:var(--blue);font-size:18px">✓</div>':''}
    </div>`;
  }).join('');
}

function npToggleMash(mid) {
  if(npState.mashgichim.includes(mid)) {
    npState.mashgichim = npState.mashgichim.filter(id=>id!==mid);
  } else {
    npState.mashgichim.push(mid);
  }
  renderMashgichimList();
  renderDaysMashList();
}

function renderDaysMashList() {
  const list = document.getElementById('np-days-mash-list');
  if(!list) return;
  if(npState.days.length===0){list.innerHTML='<div style="font-size:12px;color:var(--text3)">אין ימים — חזור לשלב 2</div>';return;}
  const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  list.innerHTML = npState.days.map((day,i)=>{
    const [d,m,y]=day.date.split('/');
    const dow = new Date(+y,+m-1,+d).getDay();
    const dayMash = day.mashgichim.length>0 ? day.mashgichim : npState.mashgichim;
    const names = dayMash.map(mid=>MASHGICHIM_DB[mid]?.name||mid).join(', ') || 'לפי ברירת מחדל';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--gray-bg);border-radius:var(--rs)">
      <div style="font-size:13px">יום ${HE_DAYS[dow]} · ${day.date}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text2)">${names}</span>
        <button onclick="npOpenDayMash(${i})" style="padding:3px 10px;border-radius:var(--rs);border:0.5px solid var(--border);background:none;font-size:11px;cursor:pointer;color:var(--blue);font-family:inherit">שנה</button>
      </div>
    </div>`;
  }).join('');
}



function npGoStep4() {
  if(npState.mashgichim.length===0){alert('נא לבחור לפחות משגיח אחד');return;}
  renderProjectSummary();
  npSetStep(4);
}

function renderProjectSummary() {
  const summary = document.getElementById('np-summary');
  if(!summary) return;
  const factory = DB.factories[npState.factoryId];
  const imp = DB.importers[npState.importerId];
  const prodNames = npState.products.map(pid=>DB.products[pid]?.name||'').join(', ');
  const mashNames = npState.mashgichim.map(mid=>MASHGICHIM_DB[mid]?.name||'').join(', ');
  const mashTz = MASHGICHIM_DB[npState.mashgichim[0]]?.tz||'Asia/Jerusalem';
  const tzOffset = getUtcOffsetStr(npState.factoryTz);
  const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  let daysHtml = npState.days.map((day,i)=>{
    const [d,m,y]=day.date.split('/');
    const dow = new Date(+y,+m-1,+d).getDay();
    const mashStart = convertTime(day.timeStart, npState.factoryTz, 'Asia/Jerusalem');
    const mashEnd = convertTime(day.timeEnd, npState.factoryTz, 'Asia/Jerusalem');
    const dayMash = (day.mashgichim.length>0?day.mashgichim:npState.mashgichim).map(mid=>MASHGICHIM_DB[mid]?.name||'').join(', ');
    return `<div style="padding:8px 0;border-bottom:0.5px solid var(--border);font-size:12px">
      <div style="font-weight:500;margin-bottom:3px">יום ${HE_DAYS[dow]} · ${day.date}</div>
      <div style="color:var(--text2)">🏭 מפעל: ${day.timeStart}–${day.timeEnd} (${npState.factoryTz.split('/')[1]||npState.factoryTz})</div>
      ${npState.factoryTz!=='Asia/Jerusalem'?`<div style="color:var(--blue-d)">👤 משגיח: ${mashStart}–${mashEnd} (ישראל)</div>`:''}
      <div style="color:var(--text3)">משגיחים: ${dayMash}</div>
    </div>`;
  }).join('');

  summary.innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;margin-bottom:14px">
      <span style="color:var(--text3)">מפעל</span><span style="font-weight:500">${factory?.name||'—'}</span>
      <span style="color:var(--text3)">מדינה</span><span>${factory?.country||'—'}</span>
      <span style="color:var(--text3)">יבואן</span><span>${imp?.name||'—'}</span>
      <span style="color:var(--text3)">Timezone</span><span dir="ltr">${npState.factoryTz} (${tzOffset})</span>
      <span style="color:var(--text3)">מוצרים</span><span>${prodNames}</span>
      <span style="color:var(--text3)">משגיחים</span><span>${mashNames}</span>
      <span style="color:var(--text3)">ימים</span><span>${npState.days.length} ימים</span>
    </div>
    <div style="margin-bottom:8px;font-size:12px;font-weight:500;color:var(--text2)">לוח ימים:</div>
    ${daysHtml}`;
}

function npBack1(){ npSetStep(1); }
function npBack2(){ npSetStep(2); }
function npBack3(){ npSetStep(3); }

function saveNewProject() {
  projectCounter++;
  const id = 'proj'+Date.now();
  PROJECTS_DB[id] = {
    id, number: projectCounter,
    factoryId: npState.factoryId,
    importerId: npState.importerId,
    factoryTz: npState.factoryTz,
    products: [...npState.products],
    days: JSON.parse(JSON.stringify(npState.days)),
    mashgichim: [...npState.mashgichim],
    status: 'draft',
    createdAt: new Date().toLocaleDateString('he-IL')
  };

  // Show in mashgiach personal area
  npState.mashgichim.forEach(mid => {
    if(!MASHGICHIM_DB[mid].assignments) MASHGICHIM_DB[mid].assignments = [];
    MASHGICHIM_DB[mid].assignments.push(id);
  });

  openFactory(npState.factoryId);
  setTimeout(()=>{
    const t = document.querySelector('[onclick*="fac-projects"]');
    if(t) t.click();
  }, 150);
}

// Wire datepicker for new project wizard
const _dpSelectOrig = dpSelect;
dpSelect = function(id, key, day) {
  _dpSelectOrig(id, key, day);
  // Map dp2-start/end to np-date-start/end
  const map = {'dp2-start':'np-date-start','dp2-end':'np-date-end'};
  const inputId = map[id];
  if(inputId) {
    const parts = key.split('-');
    const val = parts[2]+'/'+parts[1]+'/'+parts[0];
    const inp = document.getElementById(inputId);
    if(inp) inp.value = val;
  }
};


let _currentDayIdx = -1;

function npOpenDayMashModal(dayIdx) {
  _currentDayIdx = dayIdx;
  const day = npState.days[dayIdx];
  if(!day) return;
  const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const [d,m,y] = day.date.split('/');
  const dow = new Date(+y,+m-1,+d).getDay();
  const title = document.getElementById('dmm-title');
  if(title) title.textContent = 'שיבוץ משגיח — יום ' + HE_DAYS[dow] + ' ' + day.date;
  const currentMash = day.mashgichim.length > 0 ? day.mashgichim : [...npState.mashgichim];
  const list = document.getElementById('dmm-list');
  if(!list) return;
  list.innerHTML = Object.values(MASHGICHIM_DB).map(m=>{
    const initials = m.name.split(' ').map(w=>w[0]).join('').substring(0,2);
    const isSel = day.mashgichim.includes(m.id)||(day.mashgichim.length===0&&npState.mashgichim.includes(m.id));
    const avMap = {avail:'🟢',prefer:'🟡',unavail:'🔴',pending:'⚪'};
    return `<div class="mash-card ${isSel?'selected':''}" id="dmm-${m.id}" onclick="dmmToggle('${m.id}')">
      <div class="mash-avatar">${initials}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${m.name}</div>
        <div style="font-size:11px;color:var(--text3)">${m.code}</div>
      </div>
      <div>${avMap[m.avail]||'⚪'}</div>
      ${isSel?'<div style="color:var(--blue)">✓</div>':''}
    </div>`;
  }).join('');
  const modal = document.getElementById('day-mash-modal');
  if(modal) modal.style.display = 'flex';
}

function dmmToggle(mid) {
  const day = npState.days[_currentDayIdx];
  if(!day) return;
  // Initialize day.mashgichim if empty (clone from default)
  if(day.mashgichim.length === 0) day.mashgichim = [...npState.mashgichim];
  if(day.mashgichim.includes(mid)) day.mashgichim = day.mashgichim.filter(id=>id!==mid);
  else day.mashgichim.push(mid);
  // Re-render modal list
  npOpenDayMashModal(_currentDayIdx);
}

function resetDayToDefault() {
  if(_currentDayIdx >= 0 && npState.days[_currentDayIdx]) {
    npState.days[_currentDayIdx].mashgichim = [];
  }
  closeDayMashModal();
}

function closeDayMashModal() {
  const modal = document.getElementById('day-mash-modal');
  if(modal) modal.style.display = 'none';
  renderDaysMashList();
}


// ══ MASHGIACH DASHBOARD ══
const CURRENT_MASH_ID = 'msh1'; // In real system this comes from login
const mpvReports = [];
const mpvNotes = [];

function renderDashProjects() {
  const mash = MASHGICHIM_DB[CURRENT_MASH_ID];
  if(!mash) return;

  const assignments = mash.assignments || [];
  const search = (document.getElementById('dash-search')?.value||'').toLowerCase();
  const statusF = document.getElementById('dash-filter-status')?.value||'';

  // Get all projects assigned to this mashgiach
  const myProjects = Object.values(PROJECTS_DB).filter(p =>
    p.mashgichim && p.mashgichim.includes(CURRENT_MASH_ID)
  );

  // Filtered
  const filtered = myProjects.filter(p => {
    const factory = DB.factories[p.factoryId];
    const imp = DB.importers[p.importerId];
    if(statusF && p.status !== statusF) return false;
    if(search) {
      const text = (factory?.name||'') + (imp?.name||'') + '#'+p.number;
      if(!text.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  // Update metrics
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dash-m-active', myProjects.filter(p=>p.status==='active').length);
  set('dash-m-waiting', myProjects.filter(p=>p.status==='waiting'||p.status==='ready').length);
  set('dash-m-done', myProjects.filter(p=>p.status==='done').length);
  set('dash-m-total', myProjects.length);

  const list = document.getElementById('dash-projects-list');
  if(!list) return;

  if(filtered.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;font-size:13px;color:var(--text3);border:1px dashed var(--border);border-radius:var(--r)">' +
      (myProjects.length === 0 ? 'אין פרויקטים משובצים עדיין' : 'לא נמצאו פרויקטים לפי הסינון') + '</div>';
    return;
  }

  list.innerHTML = filtered.map(p => {
    const factory = DB.factories[p.factoryId];
    const imp = DB.importers[p.importerId];
    const st = PROJECT_STATUSES[p.status]||{lbl:'—',cls:'b-gray'};
    const prodNames = (p.products||[]).map(pid=>DB.products[pid]?.name||'').filter(Boolean).join(' · ');
    const firstDay = p.days?.[0];
    const lastDay = p.days?.[p.days.length-1];
    const dateRange = firstDay ? firstDay.date + (lastDay && lastDay.date !== firstDay.date ? ' — ' + lastDay.date : '') : '—';

    // Timezone display
    let tzInfo = '';
    if(p.factoryTz && firstDay) {
      const mashStart = convertTime(firstDay.timeStart||'09:00', p.factoryTz, 'Asia/Jerusalem');
      const mashEnd = convertTime(firstDay.timeEnd||'17:00', p.factoryTz, 'Asia/Jerusalem');
      if(p.factoryTz !== 'Asia/Jerusalem') {
        tzInfo = '<div style="font-size:11px;color:var(--blue-d);margin-top:3px">👤 ישראל: ' + mashStart + '–' + mashEnd + '</div>';
      }
    }

    return '<button class="list-card" onclick="openMashProject(\'' + p.id + '\')" style="width:100%;text-align:right;font-family:inherit;margin-bottom:8px">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;margin-bottom:2px">פרויקט #' + p.number + '</div>' +
          '<div style="font-size:12px;color:var(--text2)">' + (factory?.name||'—') + ' · ' + (imp?.name||'—') + '</div>' +
          '<div style="font-size:11px;color:var(--text3)">' + (factory?.country||'') + (p.factoryTz?' · '+p.factoryTz.split('/').pop():'') + '</div>' +
        '</div>' +
        '<span class="badge ' + st.cls + '">' + st.lbl + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:14px;font-size:12px;color:var(--text2);flex-wrap:wrap">' +
        '<span>📅 ' + dateRange + '</span>' +
        (firstDay ? '<span>⏰ ' + (firstDay.timeStart||'—') + '–' + (firstDay.timeEnd||'—') + ' (מפעל)</span>' : '') +
      '</div>' +
      tzInfo +
      (prodNames ? '<div style="font-size:11px;color:var(--text3);margin-top:4px">📦 ' + prodNames + '</div>' : '') +
    '</button>';
  }).join('');
}

function openMashProject(projId) {
  const p = PROJECTS_DB[projId];
  if(!p) return;
  const factory = DB.factories[p.factoryId];
  const imp = DB.importers[p.importerId];
  const st = PROJECT_STATUSES[p.status]||{lbl:'—',cls:'b-gray'};

  // Header
  const setEl = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v||''; };
  const setHtml = (id,v) => { const el=document.getElementById(id); if(el) el.innerHTML=v||''; };
  setEl('mpv-title', 'פרויקט #' + p.number);
  setEl('mpv-sub', (factory?.name||'') + ' → ' + (imp?.name||'') + (factory?.country?' · '+factory.country:''));

  const badgeEl = document.getElementById('mpv-status-badge');
  if(badgeEl) { badgeEl.className='badge '+st.cls; badgeEl.textContent=st.lbl; }

  // Time display
  const timesEl = document.getElementById('mpv-times');
  if(timesEl && p.days?.length > 0) {
    const firstDay = p.days[0];
    const facTz = p.factoryTz||'Asia/Jerusalem';
    let html = '<div>🏭 <strong>מפעל:</strong> ' + (firstDay.timeStart||'—') + '–' + (firstDay.timeEnd||'—') + ' (' + facTz.replace('/',' / ') + ')</div>';
    if(facTz !== 'Asia/Jerusalem') {
      const ms = convertTime(firstDay.timeStart||'09:00', facTz, 'Asia/Jerusalem');
      const me = convertTime(firstDay.timeEnd||'17:00', facTz, 'Asia/Jerusalem');
      html += '<div>👤 <strong>שעותיך:</strong> ' + ms + '–' + me + ' (Israel / Jerusalem)</div>';
    }
    html += '<div style="color:var(--text3)">📅 ' + (p.days.length===1 ? p.days[0].date : p.days[0].date + ' — ' + p.days[p.days.length-1].date) + ' · ' + p.days.length + ' ימים</div>';
    timesEl.innerHTML = html;
  }

  // Products list
  const prods = (p.products||[]).map(pid=>DB.products[pid]).filter(Boolean);
  setHtml('mpv-products-list', prods.length===0 ? '<div style="color:var(--text3);font-size:13px">אין מוצרים</div>' :
    prods.map(pr=>'<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border);font-size:13px">' +
      '<div><div style="font-weight:500">' + pr.name + '</div><div style="font-size:11px;color:var(--text3)">' + (pr.category||'') + '</div></div>' +
      '<span class="badge b-blue" style="font-size:10px">👁 השגחה צמודה</span></div>').join(''));

  // Days list
  const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  setHtml('mpv-days-list', (p.days||[]).map((day,i)=>{
    const [d,m,y]=day.date.split('/');
    const dow = new Date(+y,+m-1,+d).getDay();
    const facTz = p.factoryTz||'Asia/Jerusalem';
    const mashStart = convertTime(day.timeStart||'09:00', facTz, 'Asia/Jerusalem');
    const mashEnd = convertTime(day.timeEnd||'17:00', facTz, 'Asia/Jerusalem');
    const dayMash = (day.mashgichim?.length>0?day.mashgichim:p.mashgichim||[]).map(mid=>MASHGICHIM_DB[mid]?.name||'').join(', ');
    return '<div style="padding:8px 10px;background:var(--gray-bg);border-radius:var(--rs);margin-bottom:6px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<div style="font-size:13px;font-weight:500">יום ' + HE_DAYS[dow] + ' · ' + day.date + '</div>' +
        (dayMash ? '<span style="font-size:11px;color:var(--text3)">👤 ' + dayMash + '</span>' : '') +
      '</div>' +
      '<div style="font-size:12px;color:var(--text2)">🏭 מפעל: ' + (day.timeStart||'—') + '–' + (day.timeEnd||'—') + '</div>' +
      (facTz!=='Asia/Jerusalem' ? '<div style="font-size:12px;color:var(--blue-d)">👤 ישראל: ' + mashStart + '–' + mashEnd + '</div>' : '') +
    '</div>';
  }).join(''));

  // Factory details
  setHtml('mpv-factory-details', factory ? [
    ['שם המפעל', factory.name],
    ['שם באנגלית', factory.nameEn||'—'],
    ['מדינה', factory.country],
    ['עיר', factory.city],
    ['כתובת', factory.address],
  ].map(([k,v])=>'<div style="display:flex;gap:8px;padding:6px 0;border-bottom:0.5px solid var(--border);font-size:13px"><span style="color:var(--text3);min-width:90px">' + k + '</span><span>' + (v||'—') + '</span></div>').join('') : '');

  setHtml('mpv-factory-contacts', factory ? 
    '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px">' +
      '<div style="width:34px;height:34px;border-radius:50%;background:var(--blue-l);color:var(--blue-d);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600">' + (factory.contact?.[0]||'?') + '</div>' +
      '<div><div style="font-weight:500">' + (factory.contact||'—') + '</div>' +
      '<div style="font-size:12px;color:var(--text3)" dir="ltr">' + (factory.phone||'') + ' · ' + (factory.email||'') + '</div></div></div>' : '');

  // Location with map links
  const query = encodeURIComponent([factory?.address, factory?.city, factory?.country].filter(Boolean).join(', '));
  const isChinese = factory?.country === 'סין';
  setHtml('mpv-factory-location',
    '<div style="font-size:13px;color:var(--text2);margin-bottom:10px">📍 ' + [factory?.address, factory?.city, factory?.country].filter(Boolean).join(', ') + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    (isChinese ? '' : '<a href="https://www.google.com/maps/search/' + query + '" target="_blank" style="padding:6px 14px;border-radius:var(--rs);border:0.5px solid var(--border);background:var(--gray-bg);color:var(--text2);font-size:12px;text-decoration:none">🗺️ Google Maps</a>') +
    '<a href="https://www.openstreetmap.org/search?query=' + query + '" target="_blank" style="padding:6px 14px;border-radius:var(--rs);border:0.5px solid var(--border);background:var(--gray-bg);color:var(--text2);font-size:12px;text-decoration:none">🌍 OpenStreetMap</a>' +
    (isChinese ? '<a href="https://map.baidu.com/search/' + query + '" target="_blank" style="padding:6px 14px;border-radius:var(--rs);border:0.5px solid var(--border);background:var(--gray-bg);color:var(--text2);font-size:12px;text-decoration:none">🗺️ Baidu Maps</a>' : '') +
    '</div>');

  // Guidelines
  const facGuidelines = document.getElementById('fac-guidelines-text')?.value || factory?.notes || 'אין הנחיות כלליות';
  setEl('mpv-guideline-factory', facGuidelines);
  setEl('mpv-guideline-project', p.notes || 'אין הנחיות מיוחדות לפרויקט');

  setHtml('mpv-guideline-products', prods.map(pr=>'<div class="card" style="margin-bottom:8px"><div class="card-title">📦 ' + pr.name + '</div>' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.7">' + (pr.instructions||'אין הנחיות ספציפיות למוצר זה') + '</div></div>').join(''));

  // Raw materials
  const rmHtml = prods.map(pr=>{
    const rms = pr.rawMaterials||[];
    if(rms.length===0) return '<div class="card" style="margin-bottom:8px"><div class="card-title">📦 ' + pr.name + '</div><div style="font-size:12px;color:var(--text3)">אין חומרי גלם</div></div>';
    return '<div class="card" style="margin-bottom:8px"><div class="card-title">📦 ' + pr.name + '</div>' +
      '<table class="tbl"><thead><tr><th>שם</th><th>ספק</th><th>מקור</th><th>סטטוס</th><th>הערות</th></tr></thead><tbody>' +
      rms.map(rm=>{
        const stMap={approved:'b-green מאושר',pending:'b-amber בבדיקה',missing:'b-red חסר',na:'b-gray לא נדרש'};
        const [sc,sl]=(stMap[rm.certStatus]||'b-gray —').split(' ');
        return '<tr><td style="font-weight:500">' + rm.name + '</td><td>' + (rm.supplier||'—') + '</td><td>' + (rm.origin||'—') + '</td>' +
          '<td><span class="badge ' + sc + '" style="font-size:10px">' + sl + '</span></td><td style="font-size:12px;color:var(--text3)">' + (rm.notes||'—') + '</td></tr>';
      }).join('') +
      '</tbody></table></div>';
  }).join('');
  setHtml('mpv-rawmat-content', rmHtml||'<div style="text-align:center;padding:30px;color:var(--text3);font-size:13px">אין חומרי גלם</div>');

  // Reset tabs
  document.querySelectorAll('#s-mash-project .tab-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.querySelectorAll('#s-mash-project .tab-pane').forEach((p,i)=>p.classList.toggle('active',i===0));

  setHtml('mpv-report-list','');
  setHtml('mpv-notes-history','<div style="font-size:12px;color:var(--text3);text-align:center;padding:16px">אין דיווחים עדיין</div>');

  showScreen('s-mash-project');
}

function mpvUploadReport(input) {
  if(!input.files?.[0]) return;
  const file = input.files[0];
  const today = new Date().toLocaleDateString('he-IL');
  const item = { name:file.name, size:formatFileSize(file.size), date:today, url:URL.createObjectURL(file) };
  mpvReports.push(item);
  const list = document.getElementById('mpv-report-list');
  if(list) list.innerHTML = mpvReports.map(r=>
    '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--gray-bg);border-radius:var(--rs);padding:8px 12px;margin-bottom:4px">' +
      '<span style="font-size:12px">📋 ' + r.name + ' <span style="color:var(--text3)">(' + r.size + ')</span></span>' +
      '<a href="' + r.url + '" target="_blank" style="font-size:12px;color:var(--blue);text-decoration:none">צפה</a>' +
    '</div>').join('');
  input.value = '';
}

function mpvAddNote() {
  const text = document.getElementById('mpv-note-text')?.value?.trim();
  if(!text) { alert('נא לכתוב הערה'); return; }
  const type = document.getElementById('mpv-note-type')?.value||'note';
  const typeMap = {note:'📝 הערה',issue:'⚠️ חריגה',question:'❓ שאלה'};
  const today = new Date().toLocaleString('he-IL');
  mpvNotes.push({type, text, date:today});
  const history = document.getElementById('mpv-notes-history');
  if(history) history.innerHTML = mpvNotes.map(n=>
    '<div style="padding:10px;background:var(--gray-bg);border-radius:var(--rs);margin-bottom:6px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
        '<span style="font-size:12px;font-weight:500">' + (typeMap[n.type]||'📝') + '</span>' +
        '<span style="font-size:11px;color:var(--text3)">' + n.date + '</span>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--text2)">' + n.text + '</div>' +
    '</div>').join('');
  document.getElementById('mpv-note-text').value = '';
}

// Auto-render dash when opening
const _showScreenOrig2 = showScreen;
showScreen = function(id) {
  _showScreenOrig2(id);
  if(id === 's-dash') setTimeout(()=>{ renderDashProjects(); }, 0);
};

