# ベースイメージとしてNode.js v16を使用
FROM node:16

# アプリケーションディレクトリを作成
WORKDIR /usr/src/auth-server

# アプリケーションの依存関係をインストール
COPY package.json ./

# npmを使用してパッケージをインストール
RUN npm install

# アプリケーションのソースをコピー
COPY . .

# アプリケーションがリッスンするポートを指定
EXPOSE 5000

# アプリケーションを実行
CMD ["node", "server.js"]
