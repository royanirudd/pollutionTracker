let map;
let markers = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pollution-form');
  const reportList = document.getElementById('report-list');

  // Initialize map
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('image').value;

    if (isNaN(latitude) || latitude < -90 || latitude > 90 ||
        isNaN(longitude) || longitude < -180 || longitude > 180) {
      alert('Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.');
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, description, imageUrl }),
      });

      if (response.ok) {
        const newReport = await response.json();
        addReportToList(newReport);
        addMarkerToMap(newReport);
        form.reset();
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
      <img src="${report.imageUrl}" alt="Pollution Report Image" style="max-width: 200px;">
    `;
    reportList.prepend(li);
  }

  function addMarkerToMap(report) {
    const lat = report.location.coordinates[1];
    const lng = report.location.coordinates[0];
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<b>Description:</b> ${report.description}<br><img src="${report.imageUrl}" alt="Pollution Report Image" style="max-width: 100px;">`);
    markers.push(marker);
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
