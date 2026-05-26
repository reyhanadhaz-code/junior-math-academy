// Generic localStorage helpers + shared types for MathKids
import { useEffect, useState } from "react";

export type CartesianPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
};

export type ShapeKind = "square" | "rectangle" | "triangle" | "circle" | "trapezoid" | "parallelogram";

export type ShapeCalc = {
  id: string;
  shape: ShapeKind;
  inputs: Record<string, number>;
  perimeter: number;
  area: number;
  createdAt: number;
};

export type TransformKind = "translation" | "reflection" | "rotation" | "dilation";

export type TransformRecord = {
  id: string;
  kind: TransformKind;
  vertices: { x: number; y: number }[];
  params: Record<string, number | string>;
  result: { x: number; y: number }[];
  createdAt: number;
};

export type FavoriteRef = { kind: "cartesian" | "shape" | "transform"; id: string };

const KEYS = {
  points: "mk_points",
  shapes: "mk_shapes",
  transforms: "mk_transforms",
  favorites: "mk_favorites",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mk-storage", { detail: key }));
}

export function useLocalList<T>(key: string): [T[], (next: T[]) => void] {
  const [state, setState] = useState<T[]>([]);
  useEffect(() => {
    setState(read<T[]>(key, []));
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail === key) setState(read<T[]>(key, []));
    };
    window.addEventListener("mk-storage", handler);
    return () => window.removeEventListener("mk-storage", handler);
  }, [key]);
  const update = (next: T[]) => {
    write(key, next);
    setState(next);
  };
  return [state, update];
}

export const storageKeys = KEYS;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Favorites helpers
export function isFavorite(favs: FavoriteRef[], ref: FavoriteRef) {
  return favs.some((f) => f.kind === ref.kind && f.id === ref.id);
}
export function toggleFavorite(favs: FavoriteRef[], ref: FavoriteRef): FavoriteRef[] {
  return isFavorite(favs, ref)
    ? favs.filter((f) => !(f.kind === ref.kind && f.id === ref.id))
    : [...favs, ref];
}
