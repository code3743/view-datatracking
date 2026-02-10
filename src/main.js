import './style.css'
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapDiv = document.getElementById('map')

const map = leaflet.map(mapDiv, {
  zoomControl: false,
}
).setView([6.2442, -75.5812], 13)

leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 22,
  maxNativeZoom: 19,
}).addTo(map)


leaflet.Control.ToggleForm = leaflet.Control.extend({
  onAdd: function(map) {
    const button = leaflet.DomUtil.create('button', 'toggle-form-button');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
      </svg>
    `;
    button.addEventListener('click', function() {
      const form = document.getElementById('form');
      if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
      } else {
        form.style.display = 'none';
      }
    })
    
    return button;
  },
  onRemove: function(map) {
   
  }
})

const toggleFormControl = new leaflet.Control.ToggleForm({ position: 'topleft' })
map.addControl(toggleFormControl)

const form = document.createElement('form')
const textArea = document.createElement('textarea')
textArea.id = 'dataTracking'
textArea.placeholder = 'Ingrese la informacion del viaje aqui...'
textArea.required = true

textArea.rows = 10
textArea.cols = 30

const diameterInput = document.createElement('input')
diameterInput.id = 'diameter'
diameterInput.type = 'number'
diameterInput.placeholder = 'Ingrese el diametro del circulo'

const submitButton = document.createElement('button')
submitButton.type = 'submit'
submitButton.textContent = 'Procesar'

form.appendChild(textArea)
form.appendChild(document.createElement('br'))
form.appendChild(diameterInput)
form.appendChild(document.createElement('br'))
form.appendChild(submitButton)

document.getElementById('form').appendChild(form)

function clearMap() {
  map.eachLayer(function (layer) {
    if (layer instanceof leaflet.Marker || layer instanceof leaflet.Polyline || layer instanceof leaflet.Circle) {
      map.removeLayer(layer)
    }
  })
}


form.addEventListener('submit', function(event) {
  event.preventDefault()
  clearMap()
  if (textArea.value.trim() === '') return;
  const data = JSON.parse(textArea.value)
  const dataTracking = data['DataTracking'];
  const dataTrackingClean = data['CleanTrackingData'];

  const trackingRaw = [];
  const trackingProcessed = [];


  for (const element of dataTracking) {
      trackingRaw.push([
         element['Latitude'],
          element['Longitude'],
         element['Speed']
      ])
  }

  for (const element of dataTrackingClean) {
      trackingProcessed.push([
         element['Latitude'],
          element['Longitude'],
         element['Speed']
      ])
  }



  const origen = [data['CurrentTripLocation']['Latitude'], data['CurrentTripLocation']['Longitude'], data['CurrentTripLocation']['Adress']]
  const destino = [data['FinalTripLocation']['Latitude'], data['FinalTripLocation']['Longitude'], data['FinalTripLocation']['Adress']]
  const markerOrigen = leaflet.marker([origen[0], origen[1]]).addTo(map)
  markerOrigen.bindPopup(`<b>Origen:</b><br>${origen[2]}`).openPopup()

  const markerDestino = leaflet.marker([destino[0], destino[1]]).addTo(map)
  markerDestino.bindPopup(`<b>Destino:</b><br>${destino[2]}`).openPopup()
  

  const polyline = leaflet.polyline(trackingRaw, {color: 'blue'}).addTo(map)
  const speedAverage = trackingRaw.reduce((acc, curr) => acc + curr[2], 0) / trackingRaw.length
  polyline.bindPopup(`Velocidad promedio: ${speedAverage.toFixed(2)} km/h`).openPopup()
  map.fitBounds(polyline.getBounds())

  const polylineProcessed = leaflet.polyline(trackingProcessed, {color: 'green'}).addTo(map)
  const speedAverageProcessed = trackingProcessed.reduce((acc, curr) => acc + curr[2], 0) / trackingProcessed.length
  polylineProcessed.bindPopup(`Velocidad promedio (procesada): ${speedAverageProcessed.toFixed(2)} km/h`).openPopup()

  const diameter = Number.parseFloat(diameterInput.value)
  if (!Number.isNaN(diameter) && diameter > 0) {
    const circle = leaflet.circle([destino[0], destino[1]],
      {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: diameter
    }).addTo(map)
    circle.bindPopup(`Radio: ${diameter} metros`).openPopup()
  }

})






