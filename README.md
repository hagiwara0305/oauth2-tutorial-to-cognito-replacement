# 動作方法
1. CloudFormationを使用し、AWS環境上にCognitoを作成

    `./templete.yml`

2. ログイン用のCognitoユーザの作成

3. 環境変数ファイルの作成
    以下のファイルを作成し、「1.」で作成したCognitoの情報を追加
    ```
    ./cognito.env
    ./client/client.env
    ```

4. トップディレクトリで以下のコマンドを実行
    ※ dockerが起動している状態で
    ```
    docker-compose up
    ```

5. クライアントサーバへのアクセス

    http://localhost:3000