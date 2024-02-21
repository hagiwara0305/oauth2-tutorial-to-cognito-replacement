const express = require('express');
const request = require('request');
const app = express();
const path = require('path');

const crypto = require('crypto');
const axios = require('axios');
const session = require('express-session');

const clientId = 'buus5c0vh1t9ob4vl8soqveau';
const clientSecret = 'k4vc5bk855j6qd9dd8firfcap842i6ibgf8pp0rq7iafo1o3kbs';
const redirectUri = 'http://localhost:3000/get-token';
const scope = 'openid profile email';

// 静的ファイルのサービング設定
app.use(express.static('public'));
app.use(express.json());

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
}));

// 同期処理メソッド
const syncRequest = (parameter) => {
    return new Promise((resolve, reject) => {
        request(parameter, (error, response, body) => {
            resolve(body);
        });
    });
}

app.get('/get-token', async (req, res) => {
    // アクセストークンの取得
    console.log('-- アクセストークン取得開始 --');
    console.log(req.query);
    console.log(req.session.codeVerifier);

    const tokenUrl = `https://sample-endpoint.auth.ap-northeast-1.amazoncognito.com/oauth2/token`;

    let parameter = {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: req.query.code,
        code_verifier: req.session.codeVerifier,
    };
    console.log(parameter);

    // アクセストークン
    let accessToken = null;
    try {
        await axios.post(tokenUrl, new URLSearchParams(parameter), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            console.log('Access Token:', response.data.access_token);
            console.log('ID Token:', response.data.id_token);

            accessToken = response.data.access_token;
        }).catch(function (error) {
            console.log(error.config); // リクエストの設定情報をログに記録
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
    }

    // リソースサーバへのリクエスト
    console.log('-- リソースサーバへアクセス --');

    // アクセストークンが取得できたらリソースサーバへ必要なデータを取得する
    const resourceBody = await syncRequest({
        url: 'http://resource-server:5001/resource',
        method: 'GET',
        json: true,
        headers: { authorization: accessToken }
    });

    console.log(resourceBody);
    if (resourceBody.error) {
        return res.status(500).send('アクセストークンの取得中にエラーが発生しました');
    }

    // indexへ戻る
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// index.htmlを返す
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// login.htmlを返す
app.get('/login', (req, res) => {
    console.log(req.body);

    if (Object.keys(req.body).length === 0) {
        console.log('-- 認証処理開始 --');

        // コード検証とコードチャレンジを生成
        const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();
        console.log('Code Verifier:', codeVerifier);
        console.log('Code Challenge:', codeChallenge);

        // コード検証をセッションに登録
        req.session.codeVerifier = codeVerifier;
        console.log(req.session.codeVerifier);

        const authUrl = `https://sample-endpoint.auth.ap-northeast-1.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

        // リソースオーナーを認可サーバのログインページにリダイレクト
        res.redirect(authUrl);
    }
});


// app.jsを返す
app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.js'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`バックエンドサーバ起動中：http://localhost:${PORT}`);
});

function generateCodeVerifierAndChallenge() {
    // コード検証 (Code Verifier) を生成する
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // コード検証からコードチャレンジ (Code Challenge) を生成する
    // S256メソッドを使用するため、SHA256ハッシュを取り、base64urlエンコード
    const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = sha256.toString('base64url');

    return { codeVerifier, codeChallenge };
}