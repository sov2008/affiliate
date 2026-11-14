const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cleanCmd = `
    echo "Current active release:"
    readlink -f /var/www/promoradar.store/current
    
    # Keep the current release and 1 previous, remove all older releases
    CURRENT_REL=$(readlink -f /var/www/promoradar.store/current)
    for dir in /var/www/promoradar.store/releases/*; do
      if [ "$dir" != "$CURRENT_REL" ]; then
        echo "Removing old release: $dir"
        rm -rf "$dir"
      fi
    done

    # Clean npm cache and apt cache
    npm cache clean --force 2>/dev/null || true
    apt-get clean 2>/dev/null || true
    journalctl --vacuum-time=3d 2>/dev/null || true
    
    echo "Disk space after cleanup:"
    df -h /
  `;

  conn.exec(cleanCmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

