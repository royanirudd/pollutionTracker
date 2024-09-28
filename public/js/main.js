let map;
let markers = [];
let currentMarker;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pollution-form');
  const reportList = document.getElementById('report-list');
  const locationInput = document.getElementById('location');
  const useCurrentLocationButton = document.getElementById('use-current-location');
  const imageInput = document.getElementById('image');
  const takePictureButton = document.getElementById('take-picture');

  // Initialize map
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  useCurrentLocationButton.addEventListener('click', useCurrentLocation);
  locationInput.addEventListener('change', searchLocation);
  takePictureButton.addEventListener('click', takePicture);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newReport = await response.json();
        addReportToList(newReport);
        addMarkerToMap(newReport);
        form.reset();
        if (currentMarker) {
          map.removeLayer(currentMarker);
          currentMarker = null;
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to submit report:', errorData);
        alert(`Failed to submit report: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the report.');
    }
  });

  function addReportToList(report) {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Location:</strong> ${report.location.coordinates[1]}, ${report.location.coordinates[0]}<br>
      <strong>Description:</strong> ${report.description}<br>
      ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Pollution Report Image" style="max-width: 200px;">` : ''}
    `;
    reportList.prepend(li);
  }

  function addMarkerToMap(report) {
    const lat = report.location.coordinates[1];
    const lng = report.location.coordinates[0];
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<b>Description:</b> ${report.description}<br>${report.imageUrl ? `<img src="${report.imageUrl}" alt="Pollution Report Image" style="max-width: 100px;">` : ''}`);
    markers.push(marker);
  }

  async function searchLocation() {
    const query = locationInput.value;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        updateMapLocation(lat, lon);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location');
    }
  }

  function useCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateMapLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Error getting current location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }

  function updateMapLocation(lat, lon) {
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
    currentMarker = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 13);
    locationInput.value = `${lat}, ${lon}`;
  }

  function takePicture() {
    imageInput.click();
  }

  // Fetch and display existing reports
  fetch('/api/reports')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(reports => {
      if (Array.isArray(reports)) {
        reports.forEach(report => {
          addReportToList(report);
          addMarkerToMap(report);
        });
        // Fit map to show all markers
        if (markers.length > 0) {
          const group = new L.featureGroup(markers);
          map.fitBounds(group.getBounds());
        }
      } else {
        console.error('Expected an array of reports, but got:', reports);
      }
    })
    .catch(error => console.error('Error fetching reports:', error));
});
