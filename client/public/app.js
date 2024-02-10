$(document).ready(function() {
    $('#login').click(function() {
        console.log('-- 処理開始 --');

        // 認可サーバに認証コードをリクエスト
        $.ajax({
            url: 'http://localhost:5000/authorize',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: 'user1', password: 'password1' }),
            success: function(data) {
                console.log('-- 認可サーバからの認証コード取得完了 --')
                // バックエンドに認証コードを送信してアクセストークンを取得
                $.ajax({
                    url: 'http://localhost:3000/get-token',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ authCode: data.authCode }),
                    success: function(resourceData) {
                        console.log('-- リソースサーバからの情報をクライアントから取得 --')
                        // リソースサーバから返却されたデータを表示する
                        $('#resource').text(JSON.stringify(resourceData));
                    },
                    error: function() {
                        console.error('アクセストークンの取得に失敗しました。');
                    }
                });
            },
            error: function() {
                console.error('認証に失敗しました。');
            }
        });
    });
});
