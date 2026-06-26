import type { Participant } from '../context/ClassContext';

export interface GridConfig {
  rows: number;
  cols: number;
  cardWidth: number;
  cardHeight: number;
}

/**
 * Calculates the optimal columns and rows for a grid of items
 * to maximize the size of each item inside a given viewport,
 * maintaining a 16:9 aspect ratio.
 */
export function computeOptimalGrid(
  count: number,
  viewport: { width: number; height: number },
  gap: number = 12,
  aspectRatio: number = 16 / 9
): GridConfig {
  const { width: W, height: H } = viewport;
  if (count <= 0 || W <= 0 || H <= 0) {
    return { rows: 0, cols: 0, cardWidth: 0, cardHeight: 0 };
  }

  let bestCols = 1;
  let bestRows = 1;
  let bestWidth = 0;
  let bestHeight = 0;
  let maxArea = 0;

  // Iterate over all potential column counts
  for (let c = 1; c <= count; c++) {
    const r = Math.ceil(count / c);

    // Calculate maximum available space per card
    const availableW = (W - (c - 1) * gap) / c;
    const availableH = (H - (r - 1) * gap) / r;

    if (availableW <= 0 || availableH <= 0) continue;

    let cardW = 0;
    let cardH = 0;

    if (availableW / availableH > aspectRatio) {
      // Height is the constraint
      cardH = availableH;
      cardW = cardH * aspectRatio;
    } else {
      // Width is the constraint
      cardW = availableW;
      cardH = cardW / aspectRatio;
    }

    const area = cardW * cardH;
    if (area > maxArea) {
      maxArea = area;
      bestCols = c;
      bestRows = r;
      bestWidth = cardW;
      bestHeight = cardH;
    }
  }

  return {
    cols: bestCols,
    rows: bestRows,
    cardWidth: Math.floor(bestWidth),
    cardHeight: Math.floor(bestHeight),
  };
}

/**
 * Selects the optimal participant to spotlight/focus on
 * based on role and active speaker metrics.
 */
export function computeSpotlightParticipant(
  participants: Participant[],
  dominantSpeakerId: string | null
): Participant | null {
  if (participants.length === 0) return null;

  // 1. Find teacher / instructor (teacher, manager, admin)
  const instructor = participants.find(
    p => p.role === 'teacher' || p.role === 'admin' || p.role === 'manager'
  );
  if (instructor) return instructor;

  // 2. Find dominant speaker
  if (dominantSpeakerId) {
    const speaker = participants.find(
      p => p.id === dominantSpeakerId || (p.isLocal && dominantSpeakerId === 'local-user')
    );
    if (speaker) return speaker;
  }

  // 3. Fallback: First participant (usually local user)
  return participants[0];
}
