import { common, components } from "replugged";
import { GithubLink } from "..";
import { openGithubModal } from "../Modal";

const { ContextMenu } = components;

export default ({ links }: { links: GithubLink[] }) => {
  return (
    <ContextMenu.ContextMenu navId="gid" onClose={common.contextMenu.close}>
      {links.map((link) => (
        <ContextMenu.MenuItem
          id={`id-${link.url}-${link.path}-${link.tab}`}
          label={link.url}
          action={() => {
            openGithubModal(link);
          }}
        />
      ))}
    </ContextMenu.ContextMenu>
  );
};
