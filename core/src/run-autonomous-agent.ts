import { SiteAutonomousAgent } from './automation/site-autonomous.agent.js';

async function main() {
  const args = process.argv.slice(2);
  const agent = SiteAutonomousAgent.getInstance();

  if (args.includes('--status')) {
    const status = agent.getStatus();
    console.log('\n📊 [SiteAutonomousAgent Status]');
    console.log(`- Running: ${status.isRunning}`);
    console.log(`- Emergency Stop: ${status.emergencyStop ? '🔴 HALTED' : '🟢 CLEAR'}`);
    if (status.lastState) {
      console.log(`- Last Cycle ID: ${status.lastState.cycleId}`);
      console.log(`- Last Run At: ${status.lastState.completedAt}`);
      console.log(`- Last Topic: ${status.lastState.discoveredTopic?.title || 'None'}`);
      console.log(`- Published: ${status.lastState.contentPublishResult?.published}`);
    } else {
      console.log('- No previous cycle records found.');
    }
    process.exit(0);
  }

  if (args.includes('--daemon')) {
    const intervalArg = args.find((a) => a.startsWith('--interval='));
    const intervalMinutes = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 180;
    console.log(`Starting SiteAutonomousAgent in daemon mode (Interval: ${intervalMinutes}m)...`);
    agent.startDaemon(intervalMinutes);

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT. Halting agent...');
      agent.stopDaemon();
      process.exit(0);
    });
    return;
  }

  const dryRun = args.includes('--dry-run');
  const skipBuild = !args.includes('--build');

  console.log(`Executing single autonomous cycle (dryRun: ${dryRun})...`);
  const report = await agent.runAutonomousCycle({
    dryRun,
    skipAstroBuild: skipBuild,
  });

  console.log('\n[Cycle Execution Graph]');
  console.log(report.mermaidExecutionGraph);

  if (!report.success && !dryRun) {
    console.error('\n❌ Autonomous cycle finished with warnings/errors.');
    process.exit(1);
  } else {
    console.log('\n✅ Autonomous cycle successfully completed.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
