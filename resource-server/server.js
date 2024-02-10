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

app.get('/resource', (req, res) => {
  console.log('-- リソースサーバ処理 開始 --')
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('認証が必要です');
  }

  const token = authHeader.split(' ')[1];
  console.log(token);

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.status(403).send('無効なトークン');
    }

    console.log('-- リソースサーバ処理 完了 --')
    res.json({ content: "保護されたデータ" });
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`リソースサーバ起動中：http://localhost:${PORT}`);
});
