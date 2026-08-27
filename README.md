# Geographic Biography Timeline Prototype

This is a standalone, web-ready prototype for creating an interactive scrollytelling geographic timeline biography.

## File Structure

- `index.html` - Main HTML layout structure.
- `style.css` - Visual styling, layout splits, and animations.
- `data.js` - Contains the biography dataset array. **Edit this file to input your own data!**
- `app.js` - Dynamic logic for map panning, card syncing, filtering, and timeline playback.

## How to Run

### Option 1: Test Locally
Simply double-click `index.html` to open it directly in any modern web browser (Chrome, Firefox, Edge, Safari).

### Option 2: Put on a Web Server
Upload all extracted files to any web hosting platform or static server (e.g., Netlify, Vercel, GitHub Pages, Apache, Nginx).

## How to Customize Your Data

Open `data.js` in any text editor and edit the `bioData` array. Each location card needs:

```javascript
{
    id: 1,
    yearStart: 1970,
    yearEnd: 1988,
    yearDisplay: "1970 – 1988",
    location: "London, United Kingdom",
    lat: 51.5074,     // Latitude coordinate
    lng: -0.1278,     // Longitude coordinate
    era: "Youth",     // Matches filter tags (Youth, Academic, Career, Late Years)
    title: "Early Years & Education",
    description: "Your narrative paragraph or key details here."
}
