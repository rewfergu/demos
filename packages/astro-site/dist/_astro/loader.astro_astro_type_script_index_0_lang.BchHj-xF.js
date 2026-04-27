import{p as M,e as F,s as j,P as D}from"./marker-drag.CEkcMg-c.js";import{m}from"./maplibre-gl.BnDmFfQ4.js";import"./_commonjsHelpers.Cpj98o6Y.js";const R="photo-location-db",T=2,p="entries";function k(){return new Promise((r,e)=>{const t=indexedDB.open(R,T);t.onupgradeneeded=o=>{const n=o.target.result;n.objectStoreNames.contains(p)&&n.deleteObjectStore(p),n.createObjectStore(p,{keyPath:"id",autoIncrement:!0})},t.onsuccess=()=>r(t.result),t.onerror=()=>e(t.error)})}async function O(r){const e=await k();return new Promise((t,o)=>{const n=e.transaction(p,"readwrite"),c=n.objectStore(p).add({...r,createdAt:Date.now()});c.onsuccess=()=>t(c.result),c.onerror=()=>o(c.error),n.oncomplete=()=>e.close()})}async function U(){const r=await k();return new Promise((e,t)=>{const o=r.transaction(p,"readonly"),l=o.objectStore(p).openCursor(),c=[];l.onsuccess=()=>{const i=l.result;if(i){const{photoThumb:d,photoFull:g,...w}=i.value;c.push(w),i.continue()}else e(c)},l.onerror=()=>t(l.error),o.oncomplete=()=>r.close()})}async function N(r,e="photoThumb"){const t=await k();return new Promise((o,n)=>{const l=t.transaction(p,"readonly"),i=l.objectStore(p).get(r);i.onsuccess=()=>o(i.result?.[e]??null),i.onerror=()=>n(i.error),l.oncomplete=()=>t.close()})}const q={version:8,glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{"osm-tiles":{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"&copy; OpenStreetMap contributors"}},layers:[{id:"osm-tiles-layer",type:"raster",source:"osm-tiles",minzoom:0,maxzoom:19}]};function z(r){const e=new m.Map({container:r,style:q,center:[0,20],zoom:2});return e.addControl(new m.NavigationControl,"top-right"),e}function P(r,e,t){const o=new m.Popup({offset:25,maxWidth:"280px"});let n=null;o.on("open",async()=>{const l=await t(e.id);!l||!o.isOpen()||(n&&URL.revokeObjectURL(n),n=URL.createObjectURL(l),o.setHTML(`
      <div class="marker-popup">
        <img src="${n}" alt="${e.name}" decoding="async" />
        <h3>${e.name}</h3>
        <p>${e.description}</p>
      </div>
    `))}),o.on("close",()=>{n&&(URL.revokeObjectURL(n),n=null)}),new m.Marker({color:"#e74c3c"}).setLngLat([e.lng,e.lat]).setPopup(o).addTo(r)}function C(r,e){const t=new m.Marker({color:"#3b82f6",draggable:!0});t.on("dragend",()=>{const{lng:n,lat:l}=t.getLngLat();e(n,l)});let o=!1;return{set(n,l){t.setLngLat([n,l]),o||(t.addTo(r),o=!0)},clear(){o&&(t.remove(),o=!1)}}}function G(r,e,t){if(e.length!==0)if(e.forEach(o=>P(r,o,t)),e.length===1)r.flyTo({center:[e[0].lng,e[0].lat],zoom:12});else{const o=new m.LngLatBounds;e.forEach(n=>o.extend([n.lng,n.lat])),r.fitBounds(o,{padding:60})}}const I=r=>N(r,"photoThumb");function A(r){r.innerHTML=`
    <div class="pl-layout">
      <div class="pl-sidebar">
        <form class="pl-form" id="pl-form">
          <div class="pl-field">
            <label for="pl-photo">Photo</label>
            <input type="file" id="pl-photo" accept="image/*" capture="environment" required />
            <div id="pl-preview" class="pl-preview" hidden>
              <img id="pl-preview-img" alt="Preview" />
            </div>
          </div>
          <div class="pl-field pl-row">
            <div>
              <label for="pl-lat">Latitude</label>
              <input type="number" id="pl-lat" step="any" min="-90" max="90" required placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label for="pl-lng">Longitude</label>
              <input type="number" id="pl-lng" step="any" min="-180" max="180" required placeholder="e.g. -74.0060" />
            </div>
          </div>
          <div class="pl-marker-drag-wrap">
            <button
              type="button"
              id="pl-marker-drag"
              class="pl-marker-drag"
              aria-label="Drag onto the map to set the location"
              title="Drag onto the map to set the location"
            >${D}</button>
            <span class="pl-marker-drag-hint">Drag this pin onto the map to set the location.</span>
          </div>
          <div class="pl-gps-status" id="pl-gps-status" hidden></div>
          <div class="pl-field">
            <label for="pl-name">Location Name</label>
            <input type="text" id="pl-name" required placeholder="e.g. Brooklyn Bridge" />
          </div>
          <div class="pl-field">
            <label for="pl-desc">Description</label>
            <textarea id="pl-desc" rows="3" placeholder="Describe this place..."></textarea>
          </div>
          <button type="submit" class="pl-submit">Add to Map</button>
        </form>
      </div>
      <div class="pl-map-wrap">
        <div id="pl-map"></div>
      </div>
    </div>
  `}async function $(r="photo-location"){const e=document.getElementById(r);if(!e)return;A(e);const t=z("pl-map"),o=document.getElementById("pl-form"),n=document.getElementById("pl-photo"),l=document.getElementById("pl-preview"),c=document.getElementById("pl-preview-img"),i=document.getElementById("pl-lat"),d=document.getElementById("pl-lng"),g=document.getElementById("pl-gps-status"),w=document.getElementById("pl-map"),B=document.getElementById("pl-marker-drag");let u=null,f=null,v=!1;const E=a=>{f&&(URL.revokeObjectURL(f),f=null),a?(f=URL.createObjectURL(a),c.src=f):c.removeAttribute("src")},h=(a,s)=>{g.hidden=!1,g.textContent=a,g.className=`pl-gps-status pl-gps-${s}`},b=C(t,(a,s)=>{i.value=s.toFixed(6),d.value=a.toFixed(6)}),L=()=>{const a=parseFloat(i.value),s=parseFloat(d.value);Number.isFinite(a)&&Number.isFinite(s)&&a>=-90&&a<=90&&s>=-180&&s<=180?b.set(s,a):b.clear()};i.addEventListener("input",L),d.addEventListener("input",L),n.addEventListener("change",async()=>{const a=n.files[0];if(!a)return;u=await M(a),E(u.thumb),l.hidden=!1,h("Reading EXIF data...","missing");const s=await F(a);s?(i.value=s.lat.toFixed(6),d.value=s.lng.toFixed(6),v=!0,h("GPS coordinates extracted from photo. Drop the pin on the map to override.","found"),L(),t.flyTo({center:[s.lng,s.lat],zoom:14})):(v=!1,h("No GPS data found. Drag the pin onto the map or enter coordinates manually.","missing"))}),j(B,w,(a,s)=>{const{lng:y,lat:x}=t.unproject([a,s]),S=v;i.value=x.toFixed(6),d.value=y.toFixed(6),b.set(y,x),v=!1,h(S?"Photo GPS overwritten with marker location.":"Location set from map. Drag the marker to fine-tune.","found")},{ghostClass:"pl-marker-drag-ghost",dropTargetClass:"pl-map-drop-target"}),o.addEventListener("submit",async a=>{if(a.preventDefault(),!u)return;const s={name:document.getElementById("pl-name").value.trim(),description:document.getElementById("pl-desc").value.trim(),lat:parseFloat(i.value),lng:parseFloat(d.value),photoThumb:u.thumb,photoFull:u.full},y=await O(s);P(t,{...s,id:y},I),t.flyTo({center:[s.lng,s.lat],zoom:14}),o.reset(),l.hidden=!0,g.hidden=!0,b.clear(),E(null),u=null,v=!1});try{const a=await U();t.on("load",()=>G(t,a,I))}catch{}"serviceWorker"in navigator&&navigator.serviceWorker.register("/photo-location-sw.js").catch(()=>{})}$("photo-location");
