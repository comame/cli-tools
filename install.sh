curl -sSLf https://raw.githubusercontent.com/comame/cli-tools/main/cli-tools/bin/index.js -o /tmp/cli-tools-installer.js
node /tmp/cli-tools-installer.js install
~/.local/bin/tools install
echo "Run \`echo \"export PATH=\\\$PATH:\\\$HOME/.local/bin\" >> ~/.bashrc\` as needed."
