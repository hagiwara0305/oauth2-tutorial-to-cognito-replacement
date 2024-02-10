const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const app = express();

// CORS対策(今回はフルアクセス許可として設定)
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access_token'
    )
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.sendStatus(200)
    } else {
        next()
    }
}
app.use(bodyParser.json());
app.use(allowCrossDomain);

const users = [
    // 仮のユーザーデータ
    { "username": "user1", "password": "password1", "userId": "1" }
];

app.post('/token', (req, res) => {
    console.log('-- アクセストークン発行 --')

    const authCode = req.body.authCode;
    const user = users.find(user => user.userId == authCode);

    if (!user) {
        return res.status(401).send('認証エラー');
    }

    const token = jwt.sign({ userId: user.userId }, 'secretKey', { expiresIn: '1h' });
    console.log(token);

    res.json({ accessToken: token });
});

// 認証コードの生成と送信
app.post('/authorize', (req, res) => {
    console.log('-- 認証処理開始 --')
    const { username, password } = req.body;
    const user = users.find(user => user.username == username);

    if (!user || user.password !== password) {
      return res.status(401).send('認証エラー');
    }

    // 簡単な例として、ユーザーIDを認証コードとして使用
    const authCode = user.userId;
    console.log(authCode)
    res.json({ authCode: authCode });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`認可サーバ起動中：http://localhost:${PORT}`);
});
