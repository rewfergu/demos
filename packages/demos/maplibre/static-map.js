import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const data = [];
const tile =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAACXNJREFUeF7t3TFy40AMBEApukz/f6AzZs4c6f4wCFCo6ctZpEAL01hSe++fn5/vv3//Xum/v7+/l+PVz99PVoHt78/7eZ7v5/PJrv71ev3+/r4cr37pH5C/n93vjwaggWngxQGoAWgAGoAGgLAIm1UA4XcJP60/ARAAARAAAWT5ZxF0mkCO3xUEARAAARAAARBAVgEJvpvg0/oTAAEQAAEQQJZ/1gCmCeT4XUEQAAEQAAEQAAFkFZDguwk+rT8BEAABEAABZPlnDWCaQI7fFQQBEAABNAvAfgD2M7CfQ+9+DgRAAATQLAAbguzOYGZg9d/cUIcACIAACMBTAE8BsgoQzG3BEAABEAABEECWf94DIAACkCDFCaIBaAAagAaQAsq28ssjqDWA5RsgQW8n6PX7pwFoAARXLDgNQAPQADQATwHSIfY6AV1/9whCAARAAARAAASQVYAgbguCAAiAAJoFYD8A+wHYD8B+AJn/Xl6FReDbBG6/f0YAI4ARoHkEsCGIBNvckKI9gbc/PwEQAAEQgMeA6SLIdgd3foKbCI4ACIAACIAACCCrAIHcFggBEAABEAABZPnnPQgCIAAJUpwgGoAGoAFoACmgbAm2PIJaA1i+ARL0doJev38agAZAcMWC0wA0AA1AA/AUIB1irxPQ9XePIG/7AdgPwH4A9gNIA9AqrhHCCHF4hLAG4AvsC3z4Czwd4TQADUAD0AAsAqYz0LQDO757EW77/hMAARAAARAAAWQV2E4w558JigAIgAAIgACy/PNzYAk8S+Dt+hEAARAAARAAAWQV2E4w558JhAAIgAAIgACy/LMGIIFnCbxdPwIgAAIgAAIggKwC2wnm/DOBEAABEECzAOwHYD8A+wHYDyDz38siGILOCKp+u/UzAhgBjADNI8DzPN/J/y6qg+92cPVX/8n3lwAIgAAIwGPAdBFEAkvgSQJv//0QAAEQAAEQAAFkFdhOMOefCYwACIAACIAAsvzzHoQEniXwdv0IgAAIgAAIgACyCmwnmPPPBEIABEAABEAAWf5ZA5DAswTerh8BEAABEAABEEBWge0Ec/6ZQN72A7AfgP0A7AeQtX/7Abwk0CyB1G+3ftYArAFYA7AGYA0gJZAE200w9Z/VnwAIgAAIgAAIIKuABJ4l8Hb9CIAACIAACCDLP28CbieY888EQgAEQAAEQAAEkFVAAs8SeLt+BEAABEAABJDlnzWA7QRz/plACIAACIAACIAAsgpI4FkCb9ePAAiAAAiAALL8swawnWDOPxOI/QD+7AdgPwD7AaQB6PfwRggjxOERwhqAL7Av8OEv8HQE0gA0AA1AA7AImM5A0w7s+NkilvrN6kcABEAABEAABJBVQALPEni7fgRAAARAAASQ5Z8XgbYTzPlnAiEAAiAAAiAAAsgqIIFnCbxdPwIgAAIgAALI8s8awHaCOf9MIARAAARAAARAAFkFJPAsgbfrRwAEQADNAvj5+fn6PXjv78H/7Ifwav77JwACIIBmATzP8/0UF2B7BnP+2zP09ftHAARAAMUBqAFoABqABuAxYPYQzItA1wncfv0EQAAEQAAEQABZBdoT9PrnJwACIAACIIAs/6wBXE/A9usnAAIgAAIgAALIKtCeoNc/PwEQAAEQAAFk+WcN4HoCtl8/ARAAARAAARBAVoH2BL3++d/2A/ir/j24/QC6778RwAhgBDACGAEyAFsEvE7g9usnAAIgAAIgAALIKtCeoNc/PwEQAAEQAAFk+WcN4HoCtl8/ARAAARAAARBAVoH2BL3++QmAAAiAAAggyz9rANcTsP36CYAACIAACIAAsgq0J+j1z08ABEAABEAAWf5ZA7iegO3XTwAEQADNArAfQPfvwe0H0H3/CYAACKBZAM/zfD/FBWifAX3+3+oGSAAEUP0FaG+AGoAGoAEUC1gD0AA0AA3AewDeA8gq0E7o65+fAAiAAAiAALL88ybg9QRsv34CIAACIAACIICsAu0Jev3zEwABEAABEECWf9YAridg+/UTAAEQAAEQAAFkFWhP0OufnwAIgACaBWA/gO7fg9sPoPv+EwABEECzAOwH0P178OszrOuf/f0SAAEQAAF4CpCtgXsPQALPEni7fgRAAARAAARAAFkFthPM+WcCIQACIAACIIAs/6wBSOBZAm/XjwAIgAAIgAAIIKvAdoI5/0wgBEAABEAABJDlnzUACTxL4O36EQABEAABEAABZBXYTjDnnwmEAAiAAJoFYD+A7t+D2w+g+/4TAAEQQLMA7Acwm6HMoOr3OdxACIAACODwF3gaQBqABqABaAAeA2YPwbwINE0gx++OUARAAARAAARAAFkFJPhugk/rTwAEQAAEQABZ/lkDmCaQ43cFQQAEQAAEQAAEkFVAgu8m+LT+BEAABEAABJDlnzWAaQI5flcQBEAABEAABEAAWQUk+G6CT+v/th9A9+/B7QfQff+NAEYAI4ARwAiQAdgi4JSgjt8dIQiAAAiAAAiAALIKSPDdBJ/WnwAIgAAIgACy/LMGME0gx+8KggAIgAAIgAAIIKuABN9N8Gn9CYAACIAACCDLP2sA0wRy/K4gCIAACIAACIAAsgpI8N0En9afAAiAAAiAALL8swYwTSDH7wqCAAiAAJoFYD+A7t+D2w+g+/4TAAEQQLMAnuf5Xv7/zc2QuzOk+t+uPwEQAAEQgKcAngJkFSAAApAgxQmiAWgAGoAGkPHh5T2K7QZqDcAagAZe3MA1AA1AA9AALAKmht0mnPPfnsG37x8BEAABEAABEEBWge0Ec/6ZgAiAAAiAAAggyz+PsSTwLIG360cABEAABEAABJBVYDvBnH8mkLf9ALp/D24/gO77bwQwAhgBjABGgAzAFgERfEbw7foRAAEQAAEQAAFkFdhOMOefCYQACIAACIAAsvyzBiCBZwm8XT8CIAACIAACIICsAtsJ5vwzgRAAARAAARBAln/WACTwLIG360cABEAABEAABJBVYDvBnH8mEAIgAAIgAALI8s8agASeJfB2/QiAAAigWQD2A+j+Pbj9ALrvPwEQAAE0C+B5nu+nuADbM5jz356hr98/AiAAAigOQA1AA9AANACPAT0GzCpwncDt108ABEAABEAAWf55Eag9Qa9/fgIgAAIgAAIggKwC1xOw/foJgAAIgAAIIMs/awDtCXr98xMAARAAARAAAWQVuJ6A7ddPAARAAARAAFn+WQNoT9Drn/8/BL7rMUjTI04AAAAASUVORK5CYII=';

var map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'svg-background': {
        type: 'raster',
        tiles: [tile],
        tileSize: 256,
      },
      points: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      },
    },
    layers: [
      {
        id: 'static-map',
        type: 'raster',
        source: 'svg-background',
        minzoom: 0,
        maxzoom: 19,
      },
      {
        id: 'route',
        type: 'line',
        source: 'points',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ff0000',
          'line-width': 4,
          'line-dasharray': [1, 2],
        },
      },
      {
        id: 'route-points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 8,
          'circle-color': '#000000',
        },
      },
    ],
  },
  center: [-103.771556, 44.967243],
  zoom: 9,
});

map.on('click', 'route-points', function (e) {
  console.log('route-points', e);
  e.stopPropagation();
});

map.on('click', function (e) {
  console.log('click', e);
  const { lng, lat } = e.lngLat;
  data.push({ latitude: lat, longitude: lng });

  // Update the line layer with new coordinates
  const coordinates = data.map(point => [point.longitude, point.latitude]);
  map.getSource('points').setData({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
  });
});
