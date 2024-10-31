const express = require('express');
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
    res.redirect('http://52.91.194.69:3000/');
});
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}/ 에서 실행 중입니다.`);
});