import { useMemo, useState } from 'react';
import { Howl } from 'howler';

const DiceRoller = (): JSX.Element => {
  const [values, setValues] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);

  const diceSound = useMemo(
    () =>
      new Howl({
        src: ['/audio/dice-roll.wav'],
        volume: 0.45,
        preload: true
      }),
    []
  );

  const rollDice = (): void => {
    setIsRolling(true);
    diceSound.stop().play();

    setTimeout(() => {
      const nextValues: [number, number] = [
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6)
      ];
      setValues(nextValues);
      setIsRolling(false);
    }, 600);
  };


  return (
    <div className="rounded-xl border border-slate-600 bg-background-secondary p-6 text-center shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Dice</h3>
      <div className="mb-4 flex justify-center gap-3">
        {values.map((value, index) => (
          <div
            key={index}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary-500 text-2xl font-bold ${
              isRolling ? 'animate-pulse' : ''
            }`}
          >
            {value}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={rollDice}
        disabled={isRolling}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 font-medium text-white shadow transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRolling ? 'Rolling…' : 'Roll Dice'}
      </button>
    </div>
  );
};

export default DiceRoller;
