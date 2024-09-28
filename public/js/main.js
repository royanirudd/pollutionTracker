document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pollution-form');
  const reportList = document.getElementById('report-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('image').value;

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
        form.reset();
      } else {
        console.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error:', error);
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

  // Fetch and display existing reports
  fetch('/api/reports')
    .then(response => response.json())
    .then(reports => {
      reports.forEach(addReportToList);
    })
    .catch(error => console.error('Error fetching reports:', error));
});
