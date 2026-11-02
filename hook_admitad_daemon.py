import sys

path = '/var/www/affiliate/scripts/admitad_autonomous_daemon.cjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  // Update known state
  fs.writeFileSync(KNOWN_PROGRAMS_FILE, JSON.stringify({
    activeIds: Array.from(currentActiveIds),
    lastSync: new Date().toISOString()
  }, null, 2), 'utf8');"""

replacement = """  // Update known state
  fs.writeFileSync(KNOWN_PROGRAMS_FILE, JSON.stringify({
    activeIds: Array.from(currentActiveIds),
    lastSync: new Date().toISOString()
  }, null, 2), 'utf8');

  // CONTINUOUS APPLICATION LOOP:
  // Every cycle, run auto-applier to submit fresh batches to qualified high-EPC programs
  try {
    const { exec } = require('child_process');
    log('🚀 Triggering autonomous applicant batch (admitad_auto_applier.cjs)...');
    exec('NODE_PATH=/var/www/affiliate/node_modules node /var/www/affiliate/scripts/admitad_auto_applier.cjs', (err, stdout) => {
      if (stdout) console.log(stdout.trim());
      if (err) log(`Applier batch note: ${err.message}`);
    });
  } catch (appErr) {
    log(`Applier trigger error: ${appErr.message}`);
  }"""

if target not in content:
    print("ERROR: Target not found")
    sys.exit(1)

content = content.replace(target, replacement, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: continuous auto-applier integrated into admitad_autonomous_daemon")
