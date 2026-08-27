document.addEventListener('DOMContentLoaded', () => {
    // Initialize Map with dark tile layer
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: true
    });

    // Light thematic map tile layer (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    const cardsContainer = document.getElementById('cards-container');
    const timeSlider = document.getElementById('time-slider');
    const sliderLabel = document.getElementById('slider-year-label');
    const playBtn = document.getElementById('play-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let markers = [];
    let polyline = null;
    let activeCardId = null;
    let isPlaying = false;
    let playInterval = null;

    // Render Story Cards
    function renderCards(data) {
        cardsContainer.innerHTML = '';
        data.forEach(item => {
            const eraClass = getEraClass(item.era);
            const card = document.createElement('div');
            card.className = `story-card ${activeCardId === item.id ? 'active' : ''}`;
            card.dataset.id = item.id;
            card.innerHTML = `
                <div class="card-header">
                    <span class="badge ${eraClass}">${item.era}</span>
                    <span class="year-text">${item.yearDisplay}</span>
                </div>
                <h3 class="card-title">${item.title}</h3>
                <div class="card-location">📍 ${item.location}</div>
                <p class="card-desc">${item.description}</p>
            `;

            card.addEventListener('click', () => {
                selectLocation(item.id, true);
            });

            cardsContainer.appendChild(card);
        });
    }

    function getEraClass(era) {
        switch(era.toLowerCase()) {
            case 'youth': return 'badge-youth';
            case 'academic': return 'badge-academic';
            case 'grenoble': return 'badge-grenoble';
            case 'paris': return 'badge-paris';
            case 'back2indo': return 'badge-indo';
            case 'germany': return 'badge-germany';
            case 'leiden': return 'badge-leiden';
            case 'leiderdorp': return 'badge-ldorp';
            default: return 'badge-germany';
        }
    }

    // Plot Markers & Flight Path Line
    function plotMap(data) {
        // Clear existing markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        if (polyline) map.removeLayer(polyline);

        const latLngs = [];

        data.forEach(item => {
            const latLng = [item.lat, item.lng];
            latLngs.push(latLng);

            // Custom Circle Marker
            const marker = L.circleMarker(latLng, {
                radius: 8,
                fillColor: activeCardId === item.id ? '#ffffff' : '#ef4444',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);

            marker.bindPopup(`
                <div class="popup-content">
                    <h3>${item.location} (${item.yearStart})</h3>
                    <p><strong>${item.title}</strong></p>
                </div>
            `);

            marker.on('click', () => {
                selectLocation(item.id, false);
            });

            markers.push({ id: item.id, marker: marker });
        });

        // Draw animated connecting flight route (dotted line)
        if (latLngs.length > 1) {
            polyline = L.polyline(latLngs, {
                color: '#ef4444',
                weight: 2,
                dashArray: '6, 8',
                opacity: 0.7
            }).addTo(map);
        }
    }

    // Select Active Location & Pan Map
    function selectLocation(id, scrollFeed = true) {
        activeCardId = id;
        const targetData = bioData.find(d => d.id === id);
        if (!targetData) return;

        // Pan Map smoothly
        map.flyTo([targetData.lat, targetData.lng], 5, {
            duration: 1.5
        });

        // Highlight Cards
        document.querySelectorAll('.story-card').forEach(card => {
            if (parseInt(card.dataset.id) === id) {
                card.classList.add('active');
                if (scrollFeed) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                card.classList.remove('active');
            }
        });

        // Highlight Markers
        markers.forEach(mObj => {
            if (mObj.id === id) {
                mObj.marker.setStyle({ fillColor: '#38bdf8', radius: 11 });
                mObj.marker.openPopup();
            } else {
                mObj.marker.setStyle({ fillColor: '#ef4444', radius: 8 });
            }
        });

        // Update Slider value to start of event
        timeSlider.value = targetData.yearStart;
        sliderLabel.innerText = targetData.yearStart;
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const era = e.target.dataset.era;

            const filteredData = era === 'all' 
                ? bioData 
                : bioData.filter(d => d.era.toLowerCase() === era.toLowerCase());

            renderCards(filteredData);
            plotMap(filteredData);

            if (filteredData.length > 0) {
                selectLocation(filteredData[0].id);
            }
        });
    });

    // Time Slider Logic
    timeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        sliderLabel.innerText = val;
        
        // Find item matching slider year
        const currentItem = bioData.find(d => val >= d.yearStart && val <= d.yearEnd);
        if (currentItem && currentItem.id !== activeCardId) {
            selectLocation(currentItem.id, true);
        }
    });

    // Auto Play / Scrollytelling Mode
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playBtn.innerHTML = '<span class="play-icon">⏸</span> PAUSE';
            let index = 0;
            playInterval = setInterval(() => {
                if (index >= bioData.length) index = 0;
                selectLocation(bioData[index].id, true);
                index++;
            }, 3000);
        } else {
            playBtn.innerHTML = '<span class="play-icon">▶</span> PLAY / PAUSE';
            clearInterval(playInterval);
        }
    });

    // Initial Load
    renderCards(bioData);
    plotMap(bioData);
    if (bioData.length > 0) {
        selectLocation(bioData[0].id);
    }
});
