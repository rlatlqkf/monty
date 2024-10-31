const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

app.get('/data', (req, res) => {
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/data', (req, res) => {
    const { name, win } = req.body;
    const ptime = new Date().toISOString(); // Save the current date and time

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        
        let records = JSON.parse(data);
        let record = records.find(r => r.name === name);

        if (!record) {
            record = {
                name: name,
                totalcount: 1,
                cwin: win ? 1 : 0,
                cplay: win ? 1 : 0,
                nwin: win ? 0 : 1,
                nplay: win ? 0 : 1,
                ptime: ptime
            };
            records.push(record);
        } else {
            record.totalcount += 1;
            if (win) {
                record.cwin += 1;
                record.cplay += 1;
            } else {
                record.nwin += 1;
                record.nplay += 1;
            }
            record.ptime = ptime; // Update time to latest
        }

        fs.writeFile('./data.json', JSON.stringify(records, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving data');
            }
            res.status(201).send('Data saved');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
