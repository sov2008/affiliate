import fs from 'fs';
import path from 'path';

/**
 * Enterprise SQLite Online Backup & WAL Checkpoint Service
 * 
 * Safely creates consistent point-in-time snapshots of:
 * - content_queue.sqlite
 * - tg_leads.db
 * 
 * Prevents WAL file starvation, enforces synchronous flush, and rotates snapshots older than 7 days.
 */

interface BackupTarget {
  name: string;
  paths: string[];
}

const TARGETS: BackupTarget[] = [
  {
    name: 'content_queue',
    paths: [
      path.resolve(process.cwd(), 'core/data/content_queue.sqlite'),
      path.resolve(process.cwd(), 'data/content_queue.sqlite'),
      '/var/www/affiliate/core/data/content_queue.sqlite'
    ]
  },
  {
    name: 'tg_leads',
    paths: [
      path.resolve(process.cwd(), 'core/data/tg_leads.db'),
      path.resolve(process.cwd(), 'data/tg_leads.db'),
      '/var/www/affiliate/core/data/tg_leads.db'
    ]
  }
];

export async function runDatabaseBackup(): Promise<{ success: boolean; backups: string[]; errors: string[] }> {
  console.log('🔄 [DB Backup] Starting SQLite Online Backup Procedure...');

  const backupBaseDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupBaseDir)) {
    fs.mkdirSync(backupBaseDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionBackupDir = path.join(backupBaseDir, `backup_${timestamp}`);
  fs.mkdirSync(sessionBackupDir, { recursive: true });

  const createdBackups: string[] = [];
  const errors: string[] = [];

  let sqliteModule: any = null;
  try {
    sqliteModule = require('node:sqlite');
  } catch {}

  for (const target of TARGETS) {
    const activePath = target.paths.find(p => fs.existsSync(p));
    if (!activePath) {
      console.log(`ℹ️ [DB Backup] Target ${target.name} not found in search paths (skipping).`);
      continue;
    }

    const destPath = path.join(sessionBackupDir, `${target.name}.sqlite`);

    try {
      if (sqliteModule && sqliteModule.DatabaseSync) {
        // Preferred: Connect and perform safe WAL checkpoint then VACUUM INTO
        const db = new sqliteModule.DatabaseSync(activePath);
        try {
          // Truncate WAL to write changes back to main DB file
          db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
          // Perform safe online backup via VACUUM INTO
          const normalizedDest = destPath.replace(/\\/g, '/');
          db.exec(`VACUUM INTO '${normalizedDest}';`);
          console.log(`✅ [DB Backup] ${target.name} successfully backed up via VACUUM INTO -> ${destPath}`);
          createdBackups.push(destPath);
        } finally {
          db.close();
        }
      } else {
        // Fallback: Copy main file and WAL/SHM files atomically
        fs.copyFileSync(activePath, destPath);
        const walPath = `${activePath}-wal`;
        const shmPath = `${activePath}-shm`;
        if (fs.existsSync(walPath)) {
          fs.copyFileSync(walPath, `${destPath}-wal`);
        }
        if (fs.existsSync(shmPath)) {
          fs.copyFileSync(shmPath, `${destPath}-shm`);
        }
        console.log(`✅ [DB Backup] ${target.name} copied with WAL files -> ${destPath}`);
        createdBackups.push(destPath);
      }
    } catch (err: any) {
      const msg = `Failed to backup ${target.name} (${activePath}): ${err.message}`;
      console.error(`❌ [DB Backup] ${msg}`);
      errors.push(msg);
    }
  }

  // 7-day retention rotation
  try {
    const existingBackups = fs.readdirSync(backupBaseDir, { withFileTypes: true });
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const dirent of existingBackups) {
      if (dirent.isDirectory() && dirent.name.startsWith('backup_')) {
        const fullDir = path.join(backupBaseDir, dirent.name);
        const stat = fs.statSync(fullDir);
        if (now - stat.mtimeMs > SEVEN_DAYS_MS) {
          fs.rmSync(fullDir, { recursive: true, force: true });
          console.log(`🧹 [DB Backup] Rotated expired backup: ${dirent.name}`);
        }
      }
    }
  } catch (rotErr: any) {
    console.warn(`⚠️ [DB Backup] Rotation warning: ${rotErr.message}`);
  }

  console.log(`🏁 [DB Backup] Completed: ${createdBackups.length} snapshots created, ${errors.length} errors.`);
  return {
    success: errors.length === 0 && createdBackups.length > 0,
    backups: createdBackups,
    errors
  };
}

if (typeof require !== 'undefined' && require.main === module || process.argv[1]?.includes('backupDatabases')) {
  runDatabaseBackup()
    .then(res => {
      if (!res.success && res.errors.length > 0) process.exit(1);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
