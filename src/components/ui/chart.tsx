"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";

function useRoleAccent() {
  const accent = useCssVar("--role-accent", "#7C3AED");
  return { accent, accentLight: accent, accentDark: accent };
}

function useCssVar(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  const update = useCallback(() => {
    if (typeof document === "undefined") return;
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (resolved) setValue(resolved);
  }, [name]);

  useEffect(() => {
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [update]);

  return value;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function useChartColors() {
  const border = useCssVar("--border", "#d4e4ff");
  const foreground = useCssVar("--foreground", "#0f172a");
  return { border, foreground, muted: foreground };
}

function useContainerSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    };

    measure();

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef: ref, ...size };
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { color?: string; name?: string; value?: number }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="mb-1.5 text-xs font-medium text-foreground/60">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}:{" "}
          <span className={valueColor(entry.value ?? 0)}>
            {formatter ? formatter(entry.value ?? 0) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function valueColor(val: number) {
  return val >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500";
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background/60 shadow-sm dark:bg-white/3">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-foreground/50">{subtitle}</p>
        )}
      </div>
      <div className="px-2 py-4 sm:px-4 sm:py-6">{children}</div>
    </section>
  );
}

export function AreaChartCard({
  title,
  subtitle,
  data,
  categories,
  formatter,
}: {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  categories: { key: string; name: string; color?: string }[];
  formatter?: (v: number) => string;
}) {
  const colors = useChartColors();
  const isDark = useIsDark();
  const { accent, accentDark } = useRoleAccent();
  const { containerRef, width, height } = useContainerSize();

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div ref={containerRef} className="h-72 w-full">
        {width > 0 && height > 0 && (
          <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              {categories.map((cat) => {
                const gradColor = cat.color ?? (isDark ? accentDark : accent);
                return (
                <linearGradient key={cat.key} id={`gradient-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradColor} stopOpacity={isDark ? 0.2 : 0.3} />
                  <stop offset="100%" stopColor={gradColor} stopOpacity={0} />
                </linearGradient>
              );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.muted, fontSize: 12, opacity: 0.6 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.muted, fontSize: 12, opacity: 0.6 }}
              dx={-4}
            />
            <Tooltip
              content={<ChartTooltip formatter={formatter} /> as any}
              cursor={{ stroke: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
            />
            {categories.map((cat) => {
              const catColor = cat.color ?? (isDark ? accentDark : accent);
              return (
              <Line
                key={cat.key}
                type="monotone"
                dataKey={cat.key}
                name={cat.name}
                stroke={catColor}
                strokeWidth={2.5}
                dot={{ fill: catColor, strokeWidth: 0, r: 3 }}
                activeDot={{
                  fill: catColor,
                  stroke: isDark ? "#ffffff" : catColor,
                  strokeWidth: isDark ? 3 : 0,
                  r: 6,
                }}
                fillOpacity={1}
                fill={`url(#gradient-${cat.key})`}
              />
            );
            })}
          </LineChart>
        )}
      </div>
    </ChartCard>
  );
}

export function BarChartCard({
  title,
  subtitle,
  data,
  categories,
  formatter,
}: {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  categories: { key: string; name: string; color?: string }[];
  formatter?: (v: number) => string;
}) {
  const colors = useChartColors();
  const isDark = useIsDark();
  const { accentLight, accentDark } = useRoleAccent();
  const { containerRef, width, height } = useContainerSize();

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div ref={containerRef} className="h-72 w-full">
        {width > 0 && height > 0 && (
          <BarChart width={width} height={height} data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.muted, fontSize: 12, opacity: 0.6 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.muted, fontSize: 12, opacity: 0.6 }}
              dx={-4}
            />
            <Tooltip
              content={<ChartTooltip formatter={formatter} /> as any}
              cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            />
            {categories.map((cat) => (
              <Bar
                key={cat.key}
                dataKey={cat.key}
                name={cat.name}
                fill={cat.color ?? (isDark ? accentDark : accentLight)}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        )}
      </div>
    </ChartCard>
  );
}
