const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const axios = require('axios');

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

app.get('/resource', async (req, res) => {
  console.log('-- リソースサーバ処理 開始 --')
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('認証が必要です');
  }
  console.log(authHeader);

  let userInfo = null;
  try {
    const userInfoEndpoint = 'https://sample-endpoint.auth.ap-northeast-1.amazoncognito.com/oauth2/userInfo';

    const response = await axios.get(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${authHeader}`
      }
    });

    console.log('User Info:', response.data);
    userInfo = response.data;
    // 必要に応じてユーザー情報を使用
  } catch (error) {
    console.error('Error accessing user info:', error);
  }

  console.log('-- リソースサーバ処理 完了 --');
  res.json(userInfo);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`リソースサーバ起動中：http://localhost:${PORT}`);
});
