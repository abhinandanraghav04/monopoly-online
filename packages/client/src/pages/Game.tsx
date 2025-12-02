import { useMemo } from 'react';
import type { PlayerState } from '@project/rules';
import Board from '@/components/Board';
import DiceRoller from '@/components/DiceRoller';
import PlayerCard from '@/components/PlayerCard';
import { createDemoGame } from '@/utils/gameDemo';

const Game = (): JSX.Element => {
  const demoGame = useMemo(() => createDemoGame(), []);
  const players = useMemo<PlayerState[]>(
    () => Object.values(demoGame.players) as PlayerState[],
    [demoGame]
  );

  return (
    <div className="flex min-h-screen flex-col gap-6 px-6 py-8 lg:flex-row">
      <div className="flex flex-1 justify-center">
        <Board />
      </div>

      <aside className="w-full max-w-md space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Players</h2>
          <div className="grid gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.id}
                balance={player.cash}
                position={player.position}
                isActive={player.id === demoGame.currentPlayerId}
              />
            ))}
          </div>
        </section>

        <DiceRoller />

        <section className="rounded-xl border border-slate-600 bg-background-secondary p-4 text-sm text-gray-300 shadow-lg">
          <h3 className="mb-2 text-lg font-semibold text-white">Event Log</h3>
          <p>No events yet. Roll the dice to begin!</p>
        </section>
      </aside>
    </div>
  );
};

export default Game;
