const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// console.log(dataParsed);

// --- STYLES DIRECTORY IMPORTATION ---
const styles = path.join(__dirname, '../' + 'styles');
app.use(express.static(styles));

// --------- GET METHODS ---------
// Generating the home page
const getHomePage = app.get('/', (req, res) => {
    const homePage = path.join(__dirname, '../' + 'index.html');
    res.sendFile(homePage);
});

// Coordinates
const getCoords = app.get('/api/coords', (req, res) => {
    let data = fs.readFileSync(path.join(__dirname, '../' + 'js/gps-coord.json'));
    let dataParsed = JSON.parse(data);
    res.send(dataParsed);
});

module.exports = {
    app,
    getHomePage,
    getCoords
}