const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataFilePath = path.join(__dirname, 'data.json');

// JSON 파일이 존재하지 않을 경우 기본 템플릿을 생성
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
}

// 데이터를 불러오는 함수
function loadData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// 데이터를 저장하는 함수
function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// GET 요청에 대한 데이터 응답 처리
app.get('/data', (req, res) => {
    const data = loadData();
    res.json(data);
});

// PUT 요청을 통해 JSON 파일에 데이터를 추가하거나 업데이트
app.put('/save', (req, res) => {
    const { name, totalcount, cwin, nwin, cplay, nplay, ptime } = req.body;
    let data = loadData();

    // 사용자의 데이터가 이미 있는지 확인 후 갱신 또는 추가
    let entry = data.find(item => item.name === name);
    if (entry) {
        // 기존 엔트리 업데이트
        entry.totalcount = totalcount;
        entry.cwin = cwin;
        entry.nwin = nwin;
        entry.cplay = cplay;
        entry.nplay = nplay;
        entry.ptime = ptime;
    } else {
        // 새 엔트리 추가
        entry = { name, totalcount, cwin, nwin, cplay, nplay, ptime };
        data.push(entry);
    }

    saveData(data);
    res.status(200).json({ success: true });
});

// 데이터 초기화 라우트
app.get('/resetsql', (req, res) => {
    const initialData = [];
    saveData(initialData);
    res.json({ success: true, message: "Database reset successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
