import { recomputeStats, recomputeAssociations, generateRecommendations, runRecompraAlerts } from './rules';

export async function recomputeAll() {
  await recomputeStats();
  await recomputeAssociations(0);
}

export async function nightly() {
  await recomputeAll();
  await generateRecommendations({});
  await runRecompraAlerts();
}
