import{E as A}from"./exif-reader.3fswl013.js";import{m as b}from"./maplibre-gl.BnDmFfQ4.js";import"./_commonjsHelpers.Cpj98o6Y.js";async function H(n){try{const t=await n.arrayBuffer(),c=A.load(t,{expanded:!0});return c.gps&&c.gps.Latitude!=null&&c.gps.Longitude!=null?{lat:c.gps.Latitude,lng:c.gps.Longitude}:null}catch{return null}}const X={version:8,glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{"osm-tiles":{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"&copy; OpenStreetMap contributors"}},layers:[{id:"osm-tiles-layer",type:"raster",source:"osm-tiles",minzoom:0,maxzoom:19}]};function q(n){const t=new b.Map({container:n,style:X,center:[0,20],zoom:2});return t.addControl(new b.NavigationControl,"top-right"),t}function W(n,t){const c=new b.Marker({color:"#3b82f6",draggable:!0});c.on("dragend",()=>{const{lng:l,lat:i}=c.getLngLat();t(l,i)});let o=!1;return{set(l,i){c.setLngLat([l,i]),o||(c.addTo(n),o=!0)},clear(){o&&(c.remove(),o=!1)}}}const k="rc-route",V="rc-route-line",Z={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:[]}};function J(n){const t=()=>{n.getSource(k)||(n.addSource(k,{type:"geojson",data:Z}),n.addLayer({id:V,type:"line",source:k,layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#2563eb","line-width":4,"line-opacity":.85}}))};n.isStyleLoaded()?t():n.once("load",t)}function K(n){let t=[];return{render:o=>{t.forEach(e=>e.remove()),t=[];const l=n.getSource(k),i={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:o.map(e=>[e.lng,e.lat])}};if(l?l.setData(i):n.once("load",()=>n.getSource(k)?.setData(i)),o.forEach((e,d)=>{const u=document.createElement("div");u.className="rc-waypoint-marker",u.textContent=String(d+1);const r=document.createElement("div");r.className="marker-popup";const p=document.createElement("img");p.src=e.photoDataUrl,p.alt=e.name;const m=document.createElement("h3");if(m.textContent=`${d+1}. ${e.name}`,r.append(p,m),e.description){const w=document.createElement("p");w.textContent=e.description,r.append(w)}const f=new b.Popup({offset:20,maxWidth:"280px"}).setDOMContent(r),F=new b.Marker({element:u,anchor:"center"}).setLngLat([e.lng,e.lat]).setPopup(f).addTo(n);t.push(F)}),o.length>=2){const e=new b.LngLatBounds;o.forEach(d=>e.extend([d.lng,d.lat])),n.fitBounds(e,{padding:80,maxZoom:15,duration:600})}else o.length===1&&n.flyTo({center:[o[0].lng,o[0].lat],zoom:13})}}}const G=`
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;function Q(n,t=800){return new Promise(c=>{const o=new Image,l=URL.createObjectURL(n);o.onload=()=>{URL.revokeObjectURL(l);let{width:i,height:e}=o;(i>t||e>t)&&(i>e?(e=Math.round(e*t/i),i=t):(i=Math.round(i*t/e),e=t));const d=document.createElement("canvas");d.width=i,d.height=e,d.getContext("2d").drawImage(o,0,0,i,e),c(d.toDataURL("image/jpeg",.7))},o.src=l})}function ee(n){n.innerHTML=`
    <div class="rc-layout">
      <div class="rc-sidebar">
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
            >${G}</button>
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
  `}function te(n,t,c){n.addEventListener("pointerdown",o=>{if(o.button!==void 0&&o.button!==0)return;o.preventDefault(),n.setPointerCapture?.(o.pointerId);const l=document.createElement("div");l.className="rc-marker-drag-ghost",l.innerHTML=G,document.body.appendChild(l);const i=(r,p)=>{l.style.left=`${r}px`,l.style.top=`${p}px`};i(o.clientX,o.clientY);const e=(r,p)=>{const m=t.getBoundingClientRect();return r>=m.left&&r<=m.right&&p>=m.top&&p<=m.bottom},d=r=>{i(r.clientX,r.clientY),t.classList.toggle("rc-map-drop-target",e(r.clientX,r.clientY))},u=r=>{if(document.removeEventListener("pointermove",d),document.removeEventListener("pointerup",u),document.removeEventListener("pointercancel",u),l.remove(),t.classList.remove("rc-map-drop-target"),r.type==="pointerup"&&e(r.clientX,r.clientY)){const p=t.getBoundingClientRect();c(r.clientX-p.left,r.clientY-p.top)}};document.addEventListener("pointermove",d),document.addEventListener("pointerup",u),document.addEventListener("pointercancel",u)})}async function ne(n="route-creator"){const t=document.getElementById(n);if(!t)return;ee(t);const c=q("rc-map");J(c);const o=K(c),l=document.getElementById("rc-form"),i=document.getElementById("rc-photo"),e=document.getElementById("rc-preview"),d=document.getElementById("rc-preview-img"),u=document.getElementById("rc-lat"),r=document.getElementById("rc-lng"),p=document.getElementById("rc-name"),m=document.getElementById("rc-desc"),f=document.getElementById("rc-gps-status"),F=document.getElementById("rc-map"),w=document.getElementById("rc-marker-drag"),U=document.getElementById("rc-list"),O=document.getElementById("rc-count"),j=document.getElementById("rc-empty"),$=document.getElementById("rc-clear");let L=null,x=!1;const g=[];let Y=1;const I=(s,a)=>{f.hidden=!1,f.textContent=s,f.className=`rc-gps-status rc-gps-${a}`},C=W(c,(s,a)=>{u.value=a.toFixed(6),r.value=s.toFixed(6)}),M=()=>{const s=parseFloat(u.value),a=parseFloat(r.value);Number.isFinite(s)&&Number.isFinite(a)&&s>=-90&&s<=90&&a>=-180&&a<=180?C.set(a,s):C.clear()};u.addEventListener("input",M),r.addEventListener("input",M),i.addEventListener("change",async()=>{const s=i.files[0];if(!s)return;L=await Q(s),d.src=L,e.hidden=!1,I("Reading EXIF data...","missing");const a=await H(s);a?(u.value=a.lat.toFixed(6),r.value=a.lng.toFixed(6),x=!0,I("GPS coordinates extracted from photo. Drop the pin on the map to override.","found"),M(),c.flyTo({center:[a.lng,a.lat],zoom:14})):(x=!1,I("No GPS data found. Drag the pin onto the map or enter coordinates manually.","missing"))}),te(w,F,(s,a)=>{const{lng:v,lat:h}=c.unproject([s,a]),B=x;u.value=h.toFixed(6),r.value=v.toFixed(6),C.set(v,h),x=!1,I(B?"Photo GPS overwritten with marker location.":"Location set from map. Drag the marker to fine-tune.","found")});function z(){U.innerHTML="",g.forEach((a,v)=>{const h=document.createElement("li");h.className="rc-list-item";const B=document.createElement("span");B.className="rc-list-index",B.textContent=String(v+1);const S=document.createElement("img");S.className="rc-list-thumb",S.src=a.photoDataUrl,S.alt="";const R=document.createElement("div");R.className="rc-list-info";const D=document.createElement("div");D.className="rc-list-title",D.textContent=a.name;const P=document.createElement("div");P.className="rc-list-coords",P.textContent=`${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`,R.append(D,P);const y=document.createElement("button");y.type="button",y.className="rc-list-fly",y.setAttribute("aria-label",`Fly to waypoint ${v+1}`),y.textContent="Show",y.addEventListener("click",()=>{c.flyTo({center:[a.lng,a.lat],zoom:14})});const E=document.createElement("button");E.type="button",E.className="rc-list-remove",E.setAttribute("aria-label",`Remove waypoint ${v+1}`),E.textContent="×",E.addEventListener("click",()=>{const T=g.findIndex(_=>_.id===a.id);T>=0&&(g.splice(T,1),N())}),h.append(B,S,R,y,E),U.appendChild(h)});const s=g.length;O.textContent=`${s} waypoint${s===1?"":"s"}`,j.hidden=s>0,$.hidden=s===0}function N(){z(),o.render(g)}$.addEventListener("click",()=>{g.length=0,N()}),l.addEventListener("submit",s=>{if(s.preventDefault(),!L)return;const a={id:Y++,name:p.value.trim(),description:m.value.trim(),lat:parseFloat(u.value),lng:parseFloat(r.value),photoDataUrl:L};g.push(a),N(),l.reset(),e.hidden=!0,f.hidden=!0,C.clear(),L=null,x=!1}),z()}ne("route-creator");
