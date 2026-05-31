import { creatorImage } from "@/assets/creators";
import { getRankerFallback, getRankerPhoto } from "@/features/rankings/data/avatars";
import { getNextMadrid23Ms } from "@/lib/spain-time";
import type {
  TorneoMatch,
  TorneoPhase,
  TorneoPlayer,
  TorneoState,
} from "@/types/looksmax";
import type { IconName } from "@/types/icons";

function torneoPlayer(name: string, icon: IconName): TorneoPlayer {
  return {
    name,
    photo: getRankerPhoto(name) ?? creatorImage("kappah.webp"),
    icon,
  };
}

const TORNEO_PLAYERS: TorneoPlayer[] = [
  torneoPlayer("Aaronjaureguii", "star"),
  torneoPlayer("Peereira7", "goal"),
  torneoPlayer("TitoChape", "cookie"),
  torneoPlayer("RubenMaxxing", "microscope"),
  torneoPlayer("Kappah", "crown"),
  torneoPlayer("Sergi", "waves"),
  torneoPlayer("JoseNogales", "leaf"),
  torneoPlayer("Franbv", "drama"),
  torneoPlayer("Elcalvo", "brain"),
  torneoPlayer("Febron", "dumbbell"),
  torneoPlayer("Didac", "target"),
  torneoPlayer("Giva", "flame"),
  torneoPlayer("Javichu", "zap"),
  torneoPlayer("Ismael", "sparkles"),
  torneoPlayer("AlvaroSapo", "turtle"),
  torneoPlayer("Hectrollprox", "ghost"),
];

const VOTING_DURATION = 30 * 60 * 1000;

export const PHASES = {
  WAITING_OCTAVOS: "waiting_octavos",
  OCTAVOS_VOTING: "octavos_voting",
  BREAK_CUARTOS: "break_cuartos",
  CUARTOS_VOTING: "cuartos_voting",
  SEMIFINALS_PROMO: "semifinals_promo",
  SEMIFINALS_VOTING: "semifinals_voting",
  BREAK_FINAL: "break_final",
  FINAL_VOTING: "final_voting",
  TORNEO_ENDED: "torneo_ended",
} as const satisfies Record<string, TorneoPhase>;

export function getPlayerByName(name: string): TorneoPlayer {
  const found = TORNEO_PLAYERS.find((p) => p.name === name);
  if (found) return found;

  const photo = getRankerPhoto(name);
  return {
    name,
    photo: photo ?? creatorImage("kappah.webp"),
    icon: getRankerFallback(name),
  };
}

/** Estado inicial cuando termina la cuenta atrás (cuartos directo, sin octavos en UI). */
export function getInitialTorneoState(now: number): TorneoState {
  const cuartosMatches: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 4; i++) {
    const id = `cua_${i}`;
    const p1 = TORNEO_PLAYERS[i * 2];
    const p2 = TORNEO_PLAYERS[i * 2 + 1];
    cuartosMatches[id] = {
      id,
      round: "cuartos",
      p1: p1.name,
      p2: p2.name,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return {
    phase: PHASES.CUARTOS_VOTING,
    phaseStart: now,
    phaseEnd: now + VOTING_DURATION,
    cuartosMatches,
    octavosWinners: null,
    cuartosWinners: null,
    createdAt: now,
  };
}

export function createWaitingTorneoState(now = Date.now()): TorneoState {
  const phaseEnd = getNextMadrid23Ms(now);
  return {
    phase: PHASES.WAITING_OCTAVOS,
    phaseEnd,
    phaseStart: now,
    nextPhaseLabel: "Cuartos de Final",
    createdAt: now,
  };
}
