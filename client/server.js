const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('request');
const app = express();
const path = require('path');

// 静的ファイルのサービング設定
app.use(express.static('public'));
app.use(express.json());

// 同期処理メソッド
const syncRequest = (parameter) => {
    return new Promise((resolve, reject)=> {
        request(parameter, (error, response, body)=> {
            resolve(body);
        });
    });
}

app.post('/get-token', (req, res) => {
  console.log('-- 認証処理開始 --');
  console.log(req.body);
  const { authCode } = req.body;

  let accessToken = null;

  // 認可サーバにアクセストークンをリクエスト
  (async () => {
    const authBody = await syncRequest({
        url: 'http://auth-server:5000/token',
        method: 'POST',
        json: true,
        body: { authCode: authCode }
    });

    console.log(authBody);
    if(authBody.error) {
        return res.status(500).send('アクセストークンの取得中にエラーが発生しました');
    }

    // アクセストークンを取得
    accessToken = authBody.accessToken;

    console.log('-- リソースサーバへアクセス --');
    console.log(`Bearer ${accessToken}`);

    // 認証としては以上
    // アクセストークンが取得できたらリソースサーバへ必要なデータを取得する
    const resourceBody = await syncRequest({
        url: 'http://resource-server:5001/resource',
        method: 'GET',
        json: true,
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(resourceBody);
    if(resourceBody.error) {
        return res.status(500).send('アクセストークンの取得中にエラーが発生しました');
    }

    res.json(resourceBody);
  })();
});

// index.htmlを返す
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// app.jsを返す
app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.js'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`バックエンドサーバ起動中：http://localhost:${PORT}`);
});