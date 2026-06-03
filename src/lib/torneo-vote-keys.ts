export function torneoVoteDeviceKey(
  deviceId: string,
  editionStartMs: number,
  matchId: string,
): string {
  return `dev_${deviceId}_${editionStartMs}_${matchId}`;
}

export function torneoVoteIpKey(
  ipHash: string,
  editionStartMs: number,
  matchId: string,
): string {
  return `ip_${ipHash}_${editionStartMs}_${matchId}`;
}

export function torneoLocalVoteStorageKey(
  editionStartMs: number,
  matchId: string,
): string {
  return `torneoVote_${editionStartMs}_${matchId}`;
}

/** @deprecated Prefer editionStartMs-scoped keys */
export function torneoLocalVoteStorageKeyLegacy(
  createdAt: number,
  matchId: string,
): string {
  return `torneoVote_${createdAt}_${matchId}`;
}
