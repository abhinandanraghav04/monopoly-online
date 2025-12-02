import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { DiceRollResult } from '@project/rules';

interface DiceRollerProps {
  onRoll: () => void;
  lastRoll?: DiceRollResult;
  disabled?: boolean;
  isRolling?: boolean;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const randomFace = () => Math.floor(Math.random() * 6) + 1;
const randomRotation = () => ({
  x: Math.floor(Math.random() * 360),
  y: Math.floor(Math.random() * 360),
});

export function DiceRoller({ onRoll, lastRoll, disabled = false, isRolling = false }: DiceRollerProps) {
  const [animatedDice1, setAnimatedDice1] = useState(1);
  const [animatedDice2, setAnimatedDice2] = useState(1);
  const [rotation1, setRotation1] = useState({ x: 0, y: 0 });
  const [rotation2, setRotation2] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const intervalRef = useRef<number>();
  const timeoutRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);

  const playRollSound = useCallback(() => {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220 + Math.random() * 40, context.currentTime);

    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  }, []);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!isRolling) {
      clearTimers();
      setIsAnimating(false);
      if (lastRoll) {
        setAnimatedDice1(lastRoll.die1);
        setAnimatedDice2(lastRoll.die2);
      }
      setRotation1({ x: 0, y: 0 });
      setRotation2({ x: 0, y: 0 });
      return;
    }

    playRollSound();
    setIsAnimating(true);

    intervalRef.current = window.setInterval(() => {
      setAnimatedDice1(randomFace());
      setAnimatedDice2(randomFace());
      setRotation1(randomRotation());
      setRotation2(randomRotation());
    }, 90);

    timeoutRef.current = window.setTimeout(() => {
      clearTimers();
      setIsAnimating(false);
      if (lastRoll) {
        setAnimatedDice1(lastRoll.die1);
        setAnimatedDice2(lastRoll.die2);
      }
      setRotation1({ x: 0, y: 0 });
      setRotation2({ x: 0, y: 0 });
    }, 900);

    return clearTimers;
  }, [isRolling, lastRoll, clearTimers, playRollSound]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleRoll = useCallback(() => {
    if (disabled || isAnimating || isRolling) {
      return;
    }
    onRoll();
  }, [disabled, isAnimating, isRolling, onRoll]);

  const die1Face = lastRoll && !isAnimating ? lastRoll.die1 : animatedDice1;
  const die2Face = lastRoll && !isAnimating ? lastRoll.die2 : animatedDice2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        boxShadow: '0 18px 36px rgba(0, 0, 0, 0.25)',
        minWidth: '240px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          perspective: '600px',
        }}
      >
        <Die value={die1Face} rotation={rotation1} isAnimating={isAnimating} />
        <Die value={die2Face} rotation={rotation2} isAnimating={isAnimating} />
      </div>

      {lastRoll && !isAnimating && (
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 6px rgba(0, 0, 0, 0.35)',
          }}
        >
          Total: {lastRoll.total}
        </div>
      )}

      <button
        type="button"
        onClick={handleRoll}
        disabled={disabled || isAnimating}
        style={{
          padding: '12px 32px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          background:
            disabled || isAnimating
              ? '#999999'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: 'none',
          borderRadius: '999px',
          cursor: disabled || isAnimating ? 'not-allowed' : 'pointer',
          boxShadow:
            disabled || isAnimating
              ? 'none'
              : '0 14px 28px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: disabled || isAnimating ? 'scale(1)' : 'scale(1)',
        }}
        onMouseEnter={(event) => {
          if (!disabled && !isAnimating) {
            event.currentTarget.style.transform = 'scale(1.05)';
            event.currentTarget.style.boxShadow = '0 18px 36px rgba(0, 0, 0, 0.28)';
          }
        }}
        onMouseLeave={(event) => {
          if (!disabled && !isAnimating) {
            event.currentTarget.style.transform = 'scale(1)';
            event.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 0, 0, 0.25)';
          }
        }}
      >
        {isAnimating ? '🎲 Rolling...' : '🎲 Roll Dice'}
      </button>
    </div>
  );
}

interface DieProps {
  value: number;
  rotation: { x: number; y: number };
  isAnimating: boolean;
}

function Die({ value, rotation, isAnimating }: DieProps) {
  return (
    <div
      style={{
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 45%, #dddddd 100%)',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '56px',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isAnimating ? 'transform 0.12s ease' : 'transform 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.6)',
      }}
    >
      {DICE_FACES[value - 1]}
    </div>
  );
}
