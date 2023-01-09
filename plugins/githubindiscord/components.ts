import { webpack } from "replugged";
import React from "react";

export const Arrow = await webpack.waitForModule<
  // @ts-expect-error wtf is ts on about
  React.FC<{ direction: string; onClick?: () => void }>
>(webpack.filters.byProps("Directions"));
export const SelectMenu = webpack.getFunctionBySource<
  React.FC<{
    className?: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
  }>
>(
  '["value","onChange"]',
  await webpack.waitForModule(webpack.filters.bySource('["value","onChange"]')),
);
export const TabBar = webpack.getByProps("Header", "Panel", "Item") as unknown as
  | (React.FC<{
      type: string;
      selectedItem: string;
      onItemSelect: (tab: string) => void;
      className?: string;
      children: JSX.Element[];
    }> & {
      Types: { [k: string]: string };
      Looks: { [k: string]: string };
      Item: React.FC<{
        itemType: string;
        id: string;
        selectedItem: string;
        children: string;
        look?: string;
      }>;
    })
  | undefined;
