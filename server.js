const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// 데이터 가져오기
app.get('/data', (req, res) => {
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error(parseError);
            return res.status(500).send('Error parsing data');
        }
    });
});

// 데이터 저장하기 (POST)
app.post('/data', (req, res) => {
    const { name, win } = req.body;
    const ptime = new Date().toISOString(); // Save the current date and time

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        
        let records = JSON.parse(data || '[]'); // Initialize records as empty array if data is empty
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

// 데이터 업데이트하기 (PUT)
app.put('/save', (req, res) => {
    const updatedRecord = req.body;

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        
        let records = JSON.parse(data || '[]'); // Initialize records as empty array if data is empty
        let recordIndex = records.findIndex(r => r.name === updatedRecord.name);

        if (recordIndex === -1) {
            // 신규 기록 추가
            records.push(updatedRecord);
        } else {
            // 기존 기록 업데이트
            records[recordIndex] = updatedRecord;
        }

        fs.writeFile('./data.json', JSON.stringify(records, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving updated data');
            }
            res.status(200).send('Data updated successfully');
        });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
