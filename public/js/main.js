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
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.textContent = 'Loading...';
  document.body.appendChild(loadingIndicator);

  // Initialize map
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add custom map controls
  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  // Add event listener to resize map when window size changes
  window.addEventListener('resize', function() {
    map.invalidateSize();
  });

  useCurrentLocationButton.addEventListener('click', useCurrentLocation);
  locationInput.addEventListener('input', debounce(searchLocation, 500));
  takePictureButton.addEventListener('click', takePicture);

  form.addEventListener('submit', handleFormSubmit);

  function showLoading() {
    loadingIndicator.style.display = 'block';
  }

  function hideLoading() {
    loadingIndicator.style.display = 'none';
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    showLoading();

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
        // Fetch updated list of reports after successful submission
        fetchExistingReports();
      } else {
        const errorData = await response.json();
        console.error('Failed to submit report:', errorData);
        alert(`Failed to submit report: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the report.');
    } finally {
      hideLoading();
    }
  }

  function addReportToList(report) {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Location:</strong> ${report.location.coordinates[1].toFixed(6)}, ${report.location.coordinates[0].toFixed(6)}<br>
      <strong>Description:</strong> ${report.description}<br>
      ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Pollution Report Image" class="report-image">` : ''}
    `;
    li.addEventListener('click', () => {
      map.setView([report.location.coordinates[1], report.location.coordinates[0]], 15);
    });
    reportList.prepend(li);
  }

  function addMarkerToMap(report) {
    const lat = report.location.coordinates[1];
    const lng = report.location.coordinates[0];
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
      <b>Description:</b> ${report.description}<br>
      ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Pollution Report Image" class="popup-image">` : ''}
    `);
    markers.push(marker);
  }

  async function searchLocation() {
    const query = locationInput.value;
    if (query.length < 3) return;

    showLoading();
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
    } finally {
      hideLoading();
    }
  }

  function useCurrentLocation() {
    if ('geolocation' in navigator) {
      showLoading();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateMapLocation(latitude, longitude);
          hideLoading();
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Error getting current location');
          hideLoading();
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
    locationInput.value = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)}`;
  }

  function takePicture() {
    imageInput.click();
  }

  // Fetch and display existing reports
  fetchExistingReports();

  async function fetchExistingReports() {
    showLoading();
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reports = await response.json();
      if (Array.isArray(reports)) {
        // Clear existing reports and markers
        reportList.innerHTML = '';
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

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
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      hideLoading();
    }
  }

  // Utility function to debounce input events
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
});
