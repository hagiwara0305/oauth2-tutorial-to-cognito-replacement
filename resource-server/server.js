const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const axios = require('axios');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

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

const cognitoDomain = 'https://sample-endpoint.auth.ap-northeast-1.amazoncognito.com';
const region = 'ap-northeast-1';
const userPoolId = 'ap-northeast-1_KqG2wzGuL';
const clientId = 'buus5c0vh1t9ob4vl8soqveau';

app.get('/resource', async (req, res) => {
  console.log('-- リソースサーバ処理 開始 --');

  // JWTトークンの検証
  console.log('-- JWTトークンの検証 --');
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId: clientId,
      region,
    });

    const payload = await verifier.verify(req.headers.access_token);
    console.log('JWT payload:', payload);
  } catch (err) {
    console.log('Error jwt token:', err);
    return res.status(401).send('無効なトークンです');
  }

  console.log('-- アクセストークンの検証 --');
  const authHeader = req.headers.access_token;

  if (!authHeader) {
    return res.status(401).send('認証が必要です');
  }
  console.log(authHeader);

  let userInfo = null;
  try {
    const userInfoEndpoint = `${cognitoDomain}/oauth2/userInfo`;

    const response = await axios.get(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${authHeader}`
      }
    });

    console.log('User Info:', response.data);
    userInfo = response.data;
    // 必要に応じてユーザー情報を使用
  } catch (error) {
    console.log('Error get user info:', error);
    return res.status(401).send('ユーザ情報の取得に失敗しました');
  }

  console.log('-- リソースサーバ処理 完了 --');
  res.json(userInfo);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`リソースサーバ起動中：http://localhost:${PORT}`);
});