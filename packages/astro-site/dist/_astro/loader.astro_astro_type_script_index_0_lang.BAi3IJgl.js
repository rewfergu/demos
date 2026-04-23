import{E as se}from"./exif-reader.3fswl013.js";import{m as b}from"./maplibre-gl.BnDmFfQ4.js";import"./_commonjsHelpers.Cpj98o6Y.js";async function de(r){try{const n=await r.arrayBuffer(),a=se.load(n,{expanded:!0});return a.gps&&a.gps.Latitude!=null&&a.gps.Longitude!=null?{lat:a.gps.Latitude,lng:a.gps.Longitude}:null}catch{return null}}const le={version:8,glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{"osm-tiles":{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"&copy; OpenStreetMap contributors"}},layers:[{id:"osm-tiles-layer",type:"raster",source:"osm-tiles",minzoom:0,maxzoom:19}]};function me(r){const n=new b.Map({container:r,style:le,center:[0,20],zoom:2});return n.addControl(new b.NavigationControl,"top-right"),n}function ue(r,n){const a=new b.Marker({color:"#3b82f6",draggable:!0});a.on("dragend",()=>{const{lng:i,lat:d}=a.getLngLat();n(i,d)});let s=!1;return{set(i,d){a.setLngLat([i,d]),s||(a.addTo(r),s=!0)},clear(){s&&(a.remove(),s=!1)}}}const N="rc-route",pe="rc-route-line",ve={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:[]}};function ge(r){const n=()=>{r.getSource(N)||(r.addSource(N,{type:"geojson",data:ve}),r.addLayer({id:pe,type:"line",source:N,layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#2563eb","line-width":4,"line-opacity":.85}}))};r.isStyleLoaded()?n():r.once("load",n)}function fe(r){let n=[];return{render:(i,d=-1)=>{n.forEach(c=>c.remove()),n=[];const l=r.getSource(N),v={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:i.map(c=>[c.lng,c.lat])}};if(l?l.setData(v):r.once("load",()=>r.getSource(N)?.setData(v)),i.forEach((c,o)=>{const p=document.createElement("div");p.className="rc-waypoint-marker",o===d&&p.classList.add("rc-waypoint-marker-active"),p.textContent=String(o+1);const g=document.createElement("div");g.className="marker-popup";const h=document.createElement("img");h.src=c.photoDataUrl,h.alt=c.name;const S=document.createElement("h3");if(S.textContent=`${o+1}. ${c.name}`,g.append(h,S),c.description){const F=document.createElement("p");F.textContent=c.description,g.append(F)}const D=new b.Popup({offset:20,maxWidth:"280px"}).setDOMContent(g),M=new b.Marker({element:p,anchor:"center"}).setLngLat([c.lng,c.lat]).setPopup(D).addTo(r);n.push(M)}),i.length>=2){const c=new b.LngLatBounds;i.forEach(o=>c.extend([o.lng,o.lat])),r.fitBounds(c,{padding:80,maxZoom:15,duration:600})}else i.length===1&&r.flyTo({center:[i[0].lng,i[0].lat],zoom:13})},setActive:i=>{n.forEach((d,l)=>{d.getElement().classList.toggle("rc-waypoint-marker-active",l===i)})}}}const Z=`
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;function he(r,n=800){return new Promise(a=>{const s=new Image,i=URL.createObjectURL(r);s.onload=()=>{URL.revokeObjectURL(i);let{width:d,height:l}=s;(d>n||l>n)&&(d>l?(l=Math.round(l*n/d),d=n):(d=Math.round(d*n/l),l=n));const v=document.createElement("canvas");v.width=d,v.height=l,v.getContext("2d").drawImage(s,0,0,d,l),a(v.toDataURL("image/jpeg",.7))},s.src=i})}function ye(r){r.innerHTML=`
    <div class="rc-layout">
      <div class="rc-sidebar">
        <div class="rc-mode-toggle" role="tablist" aria-label="Mode">
          <button type="button" class="rc-mode-btn rc-mode-active" id="rc-mode-edit" role="tab" aria-selected="true">Edit</button>
          <button type="button" class="rc-mode-btn" id="rc-mode-view" role="tab" aria-selected="false">View</button>
        </div>
        <section class="rc-view" id="rc-view" hidden>
          <p class="rc-view-empty" id="rc-view-empty">No waypoints yet. Switch to Edit to add some.</p>
          <article class="rc-view-card" id="rc-view-card" hidden>
            <header class="rc-view-head">
              <span class="rc-view-index" id="rc-view-index">1</span>
              <span class="rc-view-position" id="rc-view-position">1 of 1</span>
            </header>
            <img class="rc-view-photo" id="rc-view-photo" alt="" />
            <h2 class="rc-view-name" id="rc-view-name"></h2>
            <p class="rc-view-desc" id="rc-view-desc" hidden></p>
            <div class="rc-view-coords" id="rc-view-coords"></div>
          </article>
          <div class="rc-view-nav" id="rc-view-nav" hidden>
            <button type="button" class="rc-view-btn" id="rc-view-prev">Previous</button>
            <button type="button" class="rc-view-btn" id="rc-view-next">Next</button>
          </div>
        </section>
        <form class="rc-form" id="rc-form">
          <div class="rc-field">
            <label for="rc-photo">Photo</label>
            <input type="file" id="rc-photo" accept="image/*" capture="environment" required />
            <div id="rc-preview" class="rc-preview" hidden>
              <img id="rc-preview-img" alt="Preview" />
            </div>
          </div>
          <div class="rc-field rc-row">
            <div>
              <label for="rc-lat">Latitude</label>
              <input type="number" id="rc-lat" step="any" min="-90" max="90" required placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label for="rc-lng">Longitude</label>
              <input type="number" id="rc-lng" step="any" min="-180" max="180" required placeholder="e.g. -74.0060" />
            </div>
          </div>
          <div class="rc-marker-drag-wrap">
            <button
              type="button"
              id="rc-marker-drag"
              class="rc-marker-drag"
              aria-label="Drag onto the map to set the location"
              title="Drag onto the map to set the location"
            >${Z}</button>
            <span class="rc-marker-drag-hint">Drag this pin onto the map to set the location.</span>
          </div>
          <div class="rc-gps-status" id="rc-gps-status" hidden></div>
          <div class="rc-field">
            <label for="rc-name">Waypoint Name</label>
            <input type="text" id="rc-name" required placeholder="e.g. Brooklyn Bridge" />
          </div>
          <div class="rc-field">
            <label for="rc-desc">Description</label>
            <textarea id="rc-desc" rows="3" placeholder="Describe this stop..."></textarea>
          </div>
          <button type="submit" class="rc-submit">Add Waypoint</button>
        </form>
        <div class="rc-route-panel">
          <div class="rc-route-header">
            <h3>Route</h3>
            <span class="rc-count" id="rc-count">0 waypoints</span>
          </div>
          <ol class="rc-list" id="rc-list"></ol>
          <p class="rc-empty" id="rc-empty">Add a waypoint to start the route.</p>
          <button type="button" class="rc-clear" id="rc-clear" hidden>Clear Route</button>
        </div>
      </div>
      <div class="rc-map-wrap">
        <div id="rc-map"></div>
      </div>
    </div>
  `}function Ee(r,n,a){r.addEventListener("pointerdown",s=>{if(s.button!==void 0&&s.button!==0)return;s.preventDefault(),r.setPointerCapture?.(s.pointerId);const i=document.createElement("div");i.className="rc-marker-drag-ghost",i.innerHTML=Z,document.body.appendChild(i);const d=(o,p)=>{i.style.left=`${o}px`,i.style.top=`${p}px`};d(s.clientX,s.clientY);const l=(o,p)=>{const g=n.getBoundingClientRect();return o>=g.left&&o<=g.right&&p>=g.top&&p<=g.bottom},v=o=>{d(o.clientX,o.clientY),n.classList.toggle("rc-map-drop-target",l(o.clientX,o.clientY))},c=o=>{if(document.removeEventListener("pointermove",v),document.removeEventListener("pointerup",c),document.removeEventListener("pointercancel",c),i.remove(),n.classList.remove("rc-map-drop-target"),o.type==="pointerup"&&l(o.clientX,o.clientY)){const p=n.getBoundingClientRect();a(o.clientX-p.left,o.clientY-p.top)}};document.addEventListener("pointermove",v),document.addEventListener("pointerup",c),document.addEventListener("pointercancel",c)})}async function we(r="route-creator"){const n=document.getElementById(r);if(!n)return;ye(n);const a=me("rc-map");ge(a);const s=fe(a),i=document.getElementById("rc-form"),d=document.getElementById("rc-photo"),l=document.getElementById("rc-preview"),v=document.getElementById("rc-preview-img"),c=document.getElementById("rc-lat"),o=document.getElementById("rc-lng"),p=document.getElementById("rc-name"),g=document.getElementById("rc-desc"),h=document.getElementById("rc-gps-status"),S=document.getElementById("rc-map"),D=document.getElementById("rc-marker-drag"),M=document.getElementById("rc-list"),F=document.getElementById("rc-count"),J=document.getElementById("rc-empty"),j=document.getElementById("rc-clear"),$=document.getElementById("rc-mode-edit"),z=document.getElementById("rc-mode-view"),K=document.getElementById("rc-view"),Q=document.getElementById("rc-view-card"),ee=document.getElementById("rc-view-empty"),te=document.getElementById("rc-view-nav"),ne=document.getElementById("rc-view-index"),oe=document.getElementById("rc-view-position"),Y=document.getElementById("rc-view-photo"),re=document.getElementById("rc-view-name"),_=document.getElementById("rc-view-desc"),ie=document.getElementById("rc-view-coords"),H=document.getElementById("rc-view-prev"),X=document.getElementById("rc-view-next");let x=null,L=!1;const u=[];let ce=1,I="edit",m=0;const B=(e,t)=>{h.hidden=!1,h.textContent=e,h.className=`rc-gps-status rc-gps-${t}`},P=ue(a,(e,t)=>{c.value=t.toFixed(6),o.value=e.toFixed(6)}),T=()=>{const e=parseFloat(c.value),t=parseFloat(o.value);Number.isFinite(e)&&Number.isFinite(t)&&e>=-90&&e<=90&&t>=-180&&t<=180?P.set(t,e):P.clear()};c.addEventListener("input",T),o.addEventListener("input",T),d.addEventListener("change",async()=>{const e=d.files[0];if(!e)return;x=await he(e),v.src=x,l.hidden=!1,B("Reading EXIF data...","missing");const t=await de(e);t?(c.value=t.lat.toFixed(6),o.value=t.lng.toFixed(6),L=!0,B("GPS coordinates extracted from photo. Drop the pin on the map to override.","found"),T(),a.flyTo({center:[t.lng,t.lat],zoom:14})):(L=!1,B("No GPS data found. Drag the pin onto the map or enter coordinates manually.","missing"))}),Ee(D,S,(e,t)=>{const{lng:f,lat:y}=a.unproject([e,t]),C=L;c.value=y.toFixed(6),o.value=f.toFixed(6),P.set(f,y),L=!1,B(C?"Photo GPS overwritten with marker location.":"Location set from map. Drag the marker to fine-tune.","found")});function q(){M.innerHTML="",u.forEach((t,f)=>{const y=document.createElement("li");y.className="rc-list-item";const C=document.createElement("span");C.className="rc-list-index",C.textContent=String(f+1);const R=document.createElement("img");R.className="rc-list-thumb",R.src=t.photoDataUrl,R.alt="";const A=document.createElement("div");A.className="rc-list-info";const G=document.createElement("div");G.className="rc-list-title",G.textContent=t.name;const O=document.createElement("div");O.className="rc-list-coords",O.textContent=`${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}`,A.append(G,O);const E=document.createElement("button");E.type="button",E.className="rc-list-fly",E.setAttribute("aria-label",`Fly to waypoint ${f+1}`),E.textContent="Show",E.addEventListener("click",()=>{I==="view"&&(m=f,k()),a.flyTo({center:[t.lng,t.lat],zoom:14})});const w=document.createElement("button");w.type="button",w.className="rc-list-remove",w.setAttribute("aria-label",`Remove waypoint ${f+1}`),w.textContent="×",w.addEventListener("click",()=>{const W=u.findIndex(ae=>ae.id===t.id);W>=0&&(u.splice(W,1),U())}),y.append(C,R,A,E,w),M.appendChild(y)});const e=u.length;F.textContent=`${e} waypoint${e===1?"":"s"}`,J.hidden=e>0,j.hidden=e===0}function k(){const e=u.length;if(ee.hidden=e>0,Q.hidden=e===0,te.hidden=e===0,e===0){s.setActive(-1);return}m<0&&(m=0),m>=e&&(m=e-1);const t=u[m];ne.textContent=String(m+1),oe.textContent=`${m+1} of ${e}`,Y.src=t.photoDataUrl,Y.alt=t.name,re.textContent=t.name,_.textContent=t.description,_.hidden=!t.description,ie.textContent=`${t.lat.toFixed(5)}, ${t.lng.toFixed(5)}`,H.disabled=m===0,X.disabled=m===e-1,s.setActive(m)}function V(e){I=e;const t=I==="edit";if($.classList.toggle("rc-mode-active",t),z.classList.toggle("rc-mode-active",!t),$.setAttribute("aria-selected",String(t)),z.setAttribute("aria-selected",String(!t)),i.hidden=!t,K.hidden=t,t)s.setActive(-1);else{k();const f=u[m];f&&a.flyTo({center:[f.lng,f.lat],zoom:14})}}function U(){q();const e=I==="view"&&u.length>0?Math.min(Math.max(m,0),u.length-1):-1;s.render(u,e),I==="view"&&k()}$.addEventListener("click",()=>V("edit")),z.addEventListener("click",()=>V("view")),H.addEventListener("click",()=>{if(m>0){m-=1,k();const e=u[m];e&&a.flyTo({center:[e.lng,e.lat],zoom:14})}}),X.addEventListener("click",()=>{if(m<u.length-1){m+=1,k();const e=u[m];e&&a.flyTo({center:[e.lng,e.lat],zoom:14})}}),j.addEventListener("click",()=>{u.length=0,U()}),i.addEventListener("submit",e=>{if(e.preventDefault(),!x)return;const t={id:ce++,name:p.value.trim(),description:g.value.trim(),lat:parseFloat(c.value),lng:parseFloat(o.value),photoDataUrl:x};u.push(t),U(),i.reset(),l.hidden=!0,h.hidden=!0,P.clear(),x=null,L=!1}),q()}we("route-creator");
