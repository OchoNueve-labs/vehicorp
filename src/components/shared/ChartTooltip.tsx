"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(label ?? "") : label;

  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-xl">
      {displayLabel && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {displayLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const formattedValue = formatter
            ? formatter(entry.value, entry.name)
            : entry.value.toLocaleString("es-CL");
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
