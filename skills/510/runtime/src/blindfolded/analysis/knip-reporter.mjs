// Knip's public reporter hook exposes configuration failures omitted by its JSON reporter.
export default function report({ issues, report: enabled, configurationHints, tagHints, hasConfigLoadErrors, counters, enabledPlugins, selectedWorkspaces, includedWorkspaceDirs }) {
  const findings = [];
  for (const [type, records] of Object.entries(issues)) {
    if (!enabled[type]) continue;
    for (const file of Object.values(records)) {
      for (const issue of Object.values(file)) findings.push({ ...issue, type });
    }
  }
  process.stdout.write(JSON.stringify({ findings, configurationHints, tagHints: [...tagHints], hasConfigLoadErrors, counters, enabledPlugins, selectedWorkspaces, includedWorkspaceDirs }));
}
