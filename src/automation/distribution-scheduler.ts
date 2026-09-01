import { DistributionScheduler } from '../../core/src/automation/distribution-scheduler.js';

export * from '../../core/src/automation/distribution-scheduler.js';
export { DistributionScheduler as default } from '../../core/src/automation/distribution-scheduler.js';

if (
  process.argv[1] &&
  (process.argv[1].endsWith('distribution-scheduler.ts') ||
    process.argv[1].endsWith('distribution-scheduler.js'))
) {
  console.log('\n🚀 Starting Autonomous Stealth Distribution Scheduler standalone runner...');
  const scheduler = DistributionScheduler.getInstance();
  scheduler.start();

  process.on('SIGINT', () => {
    console.log('\n[SIGINT] Shutting down distribution scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[SIGTERM] Shutting down distribution scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}
