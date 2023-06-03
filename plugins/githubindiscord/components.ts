import { webpack } from "replugged";
import React from "react";

export const SelectMenu = webpack.getFunctionBySource<
  React.FC<{
    className?: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
  }>
>(
  await webpack.waitForModule(webpack.filters.bySource('["value","onChange"]')),
  '["value","onChange"]',
);

export const textClasses = webpack.getByProps<Record<string, string>>("heading-sm/bold");

export const wumpus = webpack.getByProps("emptyStateImage", "emptyStateSubtext");
