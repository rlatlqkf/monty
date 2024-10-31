const express = require('express');
const app = express();
const PORT = 3000;

// 루트 경로에 대한 리디렉션 처리
app.get('/', (req, res) => {
    res.redirect('http://52.91.194.69:3000/');
});

// 다른 모든 경로는 404로 응답
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}/ 에서 실행 중입니다.`);
});
