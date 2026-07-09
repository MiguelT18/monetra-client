"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RoleAurora, type AuroraSpec } from "./RoleAurora";

const MAX_AURORAS = 5;
const SPAWN_MIN_MS = 1200;
const SPAWN_MAX_MS = 3000;
const SIZE_MIN_REM = 18;
const SIZE_MAX_REM = 38;
const DURATION_MIN_S = 8;
const DURATION_MAX_S = 14;
const PEAK_MIN = 0.22;
const PEAK_MAX = 0.42;
const POS_MIN = 5;
const POS_MAX = 90;
const DRIFT_RANGE = 45;

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

function randomBorderRadius(): string {
  const a = randomInt(25, 75);
  const b = randomInt(25, 75);
  const c = randomInt(25, 75);
  const d = randomInt(25, 75);
  const e = randomInt(25, 75);
  const f = randomInt(25, 75);
  const g = randomInt(25, 75);
  const h = randomInt(25, 75);
  return `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`;
}

function randomKeyframes(count: number, range: number): number[] {
  return Array.from({ length: count }, () => random(-range, range));
}

let nextId = 0;

function generateSpec(): AuroraSpec {
  const morph: string[] = Array.from({ length: 3 }, () => randomBorderRadius());

  return {
    id: `aurora-${nextId++}`,
    leftPct: random(POS_MIN, POS_MAX),
    topPct: random(POS_MIN, POS_MAX),
    sizeRem: random(SIZE_MIN_REM, SIZE_MAX_REM),
    duration: random(DURATION_MIN_S, DURATION_MAX_S),
    peak: random(PEAK_MIN, PEAK_MAX),
    driftX: randomKeyframes(4, DRIFT_RANGE),
    driftY: randomKeyframes(4, DRIFT_RANGE),
    morph,
  };
}

export function AuroraField() {
  const [auroras, setAuroras] = useState<AuroraSpec[]>([]);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const mountedRef = useRef(true);

  const scheduleSpawn = useCallback(() => {
    const delay = random(SPAWN_MIN_MS, SPAWN_MAX_MS);
    spawnTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setAuroras((prev) => {
        if (prev.length >= MAX_AURORAS) return prev;
        return [...prev, generateSpec()];
      });
      scheduleSpawn();
    }, delay);
  }, []);

  useEffect(() => {
    const removes = removeTimersRef.current;

    for (const a of auroras) {
      if (removes.has(a.id)) continue;
      const timer = setTimeout(() => {
        if (!mountedRef.current) return;
        setAuroras((prev) => prev.filter((x) => x.id !== a.id));
        removes.delete(a.id);
      }, a.duration * 1000);
      removes.set(a.id, timer);
    }

    return () => {
      for (const [id, timer] of removes) {
        const alive = auroras.some((a) => a.id === id);
        if (!alive) {
          clearTimeout(timer);
          removes.delete(id);
        }
      }
    };
  }, [auroras]);

  useEffect(() => {
    mountedRef.current = true;

    const initial: AuroraSpec[] = [];
    for (let i = 0; i < 3; i++) {
      initial.push(generateSpec());
    }
    setAuroras(initial);

    const initialDelay = random(800, 1500);
    const initTimer = setTimeout(() => scheduleSpawn(), initialDelay);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      for (const timer of removeTimersRef.current.values()) {
        clearTimeout(timer);
      }
      removeTimersRef.current.clear();
    };
  }, [scheduleSpawn]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {auroras.map((spec) => (
        <RoleAurora key={spec.id} {...spec} />
      ))}
    </div>
  );
}
