簡易的なファイルサーバ

## 注意

簡易的なものであり、外部ネットワークに公開するべきではない。

## インストール

### 必要

- Node.js

```
$ sudo curl -sSf -o /usr/local/bin/serve https://raw.githubusercontent.com/comame/serve/main/serve

$ sudo chmod 755 /usr/local/bin/serve
```

## 環境変数

### `PORT`

ポートを指定する。

```
$ PORT=3000 serve
```

### `DANGEROUSLY_ACCEPT_ANY_REMOTE_ADDR`

`localhost` 以外からのアクセスを許可する。

```
$ DANGEROUSLY_ACCEPT_ANY_REMOTE_ADDR=1 serve
```
