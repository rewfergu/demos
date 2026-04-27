import{p as de,e as me,s as ue,P as pe}from"./marker-drag.CEkcMg-c.js";import{m as E}from"./maplibre-gl.BnDmFfQ4.js";import"./_commonjsHelpers.Cpj98o6Y.js";const ve={version:8,glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{"osm-tiles":{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"&copy; OpenStreetMap contributors"}},layers:[{id:"osm-tiles-layer",type:"raster",source:"osm-tiles",minzoom:0,maxzoom:19}]};function ge(o){const s=new E.Map({container:o,style:ve,center:[0,20],zoom:2});return s.addControl(new E.NavigationControl,"top-right"),s}function fe(o,s){const a=new E.Marker({color:"#3b82f6",draggable:!0});a.on("dragend",()=>{const{lng:c,lat:u}=a.getLngLat();s(c,u)});let m=!1;return{set(c,u){a.setLngLat([c,u]),m||(a.addTo(o),m=!0)},clear(){m&&(a.remove(),m=!1)}}}const N="rc-route",he="rc-route-line",ye={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:[]}};function be(o){const s=()=>{o.getSource(N)||(o.addSource(N,{type:"geojson",data:ye}),o.addLayer({id:he,type:"line",source:N,layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#2563eb","line-width":4,"line-opacity":.85}}))};o.isStyleLoaded()?s():o.once("load",s)}function Ee(o){let s=[];return{render:(c,u=-1)=>{s.forEach(n=>n.remove()),s=[];const g=o.getSource(N),w={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:c.map(n=>[n.lng,n.lat])}};if(g?g.setData(w):o.once("load",()=>o.getSource(N)?.setData(w)),c.forEach((n,l)=>{const f=document.createElement("div");f.className="rc-waypoint-marker",l===u&&f.classList.add("rc-waypoint-marker-active");const x=document.createElement("div");x.className="rc-waypoint-marker-inner",x.textContent=String(l+1),f.appendChild(x);const p=document.createElement("div");p.className="marker-popup";const I=document.createElement("img");I.src=n.thumbUrl,I.alt=n.name;const R=document.createElement("h3");if(R.textContent=`${l+1}. ${n.name}`,p.append(I,R),n.description){const P=document.createElement("p");P.textContent=n.description,p.append(P)}const F=new E.Popup({offset:20,maxWidth:"280px"}).setDOMContent(p),T=new E.Marker({element:f,anchor:"center"}).setLngLat([n.lng,n.lat]).setPopup(F).addTo(o);s.push(T)}),c.length>=2){const n=new E.LngLatBounds;c.forEach(l=>n.extend([l.lng,l.lat])),o.fitBounds(n,{padding:80,maxZoom:15,duration:600})}else c.length===1&&o.flyTo({center:[c[0].lng,c[0].lat],zoom:13})},setActive:c=>{s.forEach((u,g)=>{u.getElement().classList.toggle("rc-waypoint-marker-active",g===c)})}}}function we(o){o.innerHTML=`
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
            >${pe}</button>
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
  `}async function xe(o="route-creator"){const s=document.getElementById(o);if(!s)return;we(s);const a=ge("rc-map");be(a);const m=Ee(a),c=document.getElementById("rc-form"),u=document.getElementById("rc-photo"),g=document.getElementById("rc-preview"),w=document.getElementById("rc-preview-img"),n=document.getElementById("rc-lat"),l=document.getElementById("rc-lng"),f=document.getElementById("rc-name"),x=document.getElementById("rc-desc"),p=document.getElementById("rc-gps-status"),I=document.getElementById("rc-map"),R=document.getElementById("rc-marker-drag"),F=document.getElementById("rc-list"),T=document.getElementById("rc-count"),P=document.getElementById("rc-empty"),H=document.getElementById("rc-clear"),$=document.getElementById("rc-mode-edit"),A=document.getElementById("rc-mode-view"),ee=document.getElementById("rc-view"),te=document.getElementById("rc-view-card"),ne=document.getElementById("rc-view-empty"),oe=document.getElementById("rc-view-nav"),re=document.getElementById("rc-view-index"),ce=document.getElementById("rc-view-position"),V=document.getElementById("rc-view-photo"),ie=document.getElementById("rc-view-name"),W=document.getElementById("rc-view-desc"),ae=document.getElementById("rc-view-coords"),Y=document.getElementById("rc-view-prev"),X=document.getElementById("rc-view-next");let v=null,L=null,B=!1;const i=[];let se=1,k="edit",r=0;const Z=e=>{L&&(URL.revokeObjectURL(L),L=null),e?(L=URL.createObjectURL(e),w.src=L):w.removeAttribute("src")},J=e=>{e.thumbUrl&&URL.revokeObjectURL(e.thumbUrl),e.fullUrl&&URL.revokeObjectURL(e.fullUrl)},C=(e,t)=>{p.hidden=!1,p.textContent=e,p.className=`rc-gps-status rc-gps-${t}`},M=fe(a,(e,t)=>{n.value=t.toFixed(6),l.value=e.toFixed(6)}),O=()=>{const e=parseFloat(n.value),t=parseFloat(l.value);Number.isFinite(e)&&Number.isFinite(t)&&e>=-90&&e<=90&&t>=-180&&t<=180?M.set(t,e):M.clear()};n.addEventListener("input",O),l.addEventListener("input",O),u.addEventListener("change",async()=>{const e=u.files[0];if(!e)return;v=await de(e),Z(v.thumb),g.hidden=!1,C("Reading EXIF data...","missing");const t=await me(e);t?(n.value=t.lat.toFixed(6),l.value=t.lng.toFixed(6),B=!0,C("GPS coordinates extracted from photo. Drop the pin on the map to override.","found"),O(),a.flyTo({center:[t.lng,t.lat],zoom:14})):(B=!1,C("No GPS data found. Drag the pin onto the map or enter coordinates manually.","missing"))}),ue(R,I,(e,t)=>{const{lng:d,lat:h}=a.unproject([e,t]),U=B;n.value=h.toFixed(6),l.value=d.toFixed(6),M.set(d,h),B=!1,C(U?"Photo GPS overwritten with marker location.":"Location set from map. Drag the marker to fine-tune.","found")},{ghostClass:"rc-marker-drag-ghost",dropTargetClass:"rc-map-drop-target"});function K(){F.innerHTML="",i.forEach((t,d)=>{const h=document.createElement("li");h.className="rc-list-item";const U=document.createElement("span");U.className="rc-list-index",U.textContent=String(d+1);const D=document.createElement("img");D.className="rc-list-thumb",D.src=t.thumbUrl,D.alt="";const j=document.createElement("div");j.className="rc-list-info";const G=document.createElement("div");G.className="rc-list-title",G.textContent=t.name;const _=document.createElement("div");_.className="rc-list-coords",_.textContent=`${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}`,j.append(G,_);const y=document.createElement("button");y.type="button",y.className="rc-list-fly",y.setAttribute("aria-label",`Fly to waypoint ${d+1}`),y.textContent="Show",y.addEventListener("click",()=>{k==="view"&&(r=d,S()),a.flyTo({center:[t.lng,t.lat],zoom:14})});const b=document.createElement("button");b.type="button",b.className="rc-list-remove",b.setAttribute("aria-label",`Remove waypoint ${d+1}`),b.textContent="×",b.addEventListener("click",()=>{const q=i.findIndex(le=>le.id===t.id);q>=0&&(J(i[q]),i.splice(q,1),z())}),h.append(U,D,j,y,b),F.appendChild(h)});const e=i.length;T.textContent=`${e} waypoint${e===1?"":"s"}`,P.hidden=e>0,H.hidden=e===0}function S(){const e=i.length;if(ne.hidden=e>0,te.hidden=e===0,oe.hidden=e===0,e===0){m.setActive(-1);return}r<0&&(r=0),r>=e&&(r=e-1);const t=i[r];re.textContent=String(r+1),ce.textContent=`${r+1} of ${e}`,V.src=t.fullUrl,V.alt=t.name,ie.textContent=t.name,W.textContent=t.description,W.hidden=!t.description,ae.textContent=`${t.lat.toFixed(5)}, ${t.lng.toFixed(5)}`,Y.disabled=r===0,X.disabled=r===e-1,m.setActive(r)}function Q(e){k=e;const t=k==="edit";if($.classList.toggle("rc-mode-active",t),A.classList.toggle("rc-mode-active",!t),$.setAttribute("aria-selected",String(t)),A.setAttribute("aria-selected",String(!t)),c.hidden=!t,ee.hidden=t,t)m.setActive(-1);else{S();const d=i[r];d&&a.flyTo({center:[d.lng,d.lat],zoom:14})}}function z(){K();const e=k==="view"&&i.length>0?Math.min(Math.max(r,0),i.length-1):-1;m.render(i,e),k==="view"&&S()}$.addEventListener("click",()=>Q("edit")),A.addEventListener("click",()=>Q("view")),Y.addEventListener("click",()=>{if(r>0){r-=1,S();const e=i[r];e&&a.flyTo({center:[e.lng,e.lat],zoom:14})}}),X.addEventListener("click",()=>{if(r<i.length-1){r+=1,S();const e=i[r];e&&a.flyTo({center:[e.lng,e.lat],zoom:14})}}),H.addEventListener("click",()=>{i.forEach(J),i.length=0,z()}),c.addEventListener("submit",e=>{if(e.preventDefault(),!v)return;const t={id:se++,name:f.value.trim(),description:x.value.trim(),lat:parseFloat(n.value),lng:parseFloat(l.value),photoThumb:v.thumb,photoFull:v.full,thumbUrl:URL.createObjectURL(v.thumb),fullUrl:URL.createObjectURL(v.full)};i.push(t),z(),c.reset(),g.hidden=!0,p.hidden=!0,M.clear(),Z(null),v=null,B=!1}),K()}xe("route-creator");
