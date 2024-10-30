const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000; // 포트 번호를 3000으로 변경

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // 정적 파일 제공을 위한 디렉터리

// JSON 파일 경로
const dataFilePath = path.join(__dirname, 'public/data.json');

app.get('/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => { // data.json 파일을 올바르게 읽도록 경로 수정
        if (err) {
            console.error('파일을 읽는 중 오류 발생:', err);
            return res.status(500).send('파일을 읽는 중 오류 발생');
        }

        // JSON 파싱
        let jsonData = JSON.parse(data);

        // 데이터 정렬
        jsonData.sort((a, b) => b.totalcount - a.totalcount); // 'totalcount'에 따라 정렬

        // JSON 데이터 응답
        res.json(jsonData);
    });
});

// 데이터 저장
app.post('/save', (req, res) => {
    const leaderboardData = req.body;

    // 데이터를 파일에 저장
    fs.writeFile(dataFilePath, JSON.stringify(leaderboardData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('파일 쓰기 오류:', err);
            return res.status(500).send('데이터를 저장하는 데 문제가 발생했습니다.');
        }
        res.send('데이터가 성공적으로 저장되었습니다.');
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
