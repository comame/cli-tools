mkdir -p /usr/local/lib/cli-tools/runner/bin
curl -sSLf https://raw.githubusercontent.com/comame/cli-tools/main/runner/bin/index.js -o /usr/local/lib/cli-tools/runner/bin/index.js
curl -sSLf https://raw.githubusercontent.com/comame/cli-tools/main/commands.json -o /usr/local/lib/cli-tools/commands.json
chmod +x /usr/local/lib/cli-tools/runner/bin/index.js
/usr/local/lib/cli-tools/runner/bin/index.js install
