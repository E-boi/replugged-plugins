import { components, webpack } from "replugged";

const { Tooltip } = components;

const icon = await webpack.waitForModule<{
  iconItem: string;
  actionIcon: string;
  iconBase: string;
}>(webpack.filters.byProps("iconItem"));

export default function LinkButton({ channel }: { channel: { id: string } }) {
  if (!channel) return null;
  return (
    <Tooltip text="Copy Channel">
      <div className={[icon?.iconItem, icon?.iconBase].filter(Boolean).join(" ")}>
        <svg
          className={icon?.actionIcon}
          width={25}
          height={25}
          viewBox={"0 0 25 25"}
          onClick={() => window.DiscordNative?.clipboard?.copy?.(`<#${channel.id}>`)}>
          <path
            d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"
            fill="currentColor"
          />
        </svg>
      </div>
    </Tooltip>
  );
}
