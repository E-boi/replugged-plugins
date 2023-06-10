import { ReactElement } from "react";
import { util, webpack } from "replugged";
import { injector } from ".";
import { Channel, User, getChannelIconURL } from "./components";

type Predicate<Arg> = (arg: Arg) => boolean;

export function findInReactTree(
  node: ReactElement | ReactElement[],
  predicate: Predicate<ReactElement>,
): ReactElement | null {
  const stack = [node].flat();

  while (stack.length !== 0) {
    const node = stack.pop();

    if (node && predicate(node)) {
      return node;
    }

    if (node?.props?.children) {
      stack.push(...[node.props.children].flat());
    }
  }

  return null;
}

export function forceUpdate(element: Element | null): void {
  if (!element) return;

  const instance = util.getOwnerInstance(element);
  if (instance) {
    const forceRerender = injector.instead(instance, "render", () => {
      forceRerender();

      return null;
    });

    instance.forceUpdate(() => instance.forceUpdate(() => {}));
  }
}

export function getChannelName(channel: Channel) {
  return channel.type === 3
    ? channel.name || channel.rawRecipients?.map((e) => e.username).join(", ")
    : channel.rawRecipients[0].username;
}

export const { getUser } = webpack.getByProps<{
  getUser: (id: string) => User;
  findByTag: (tag: string) => User;
}>("getUser", "findByTag")!;

export function getChannelIcon(channel: Channel) {
  if (channel.type === 3) return getChannelIconURL(channel);

  return getUser(channel.rawRecipients[0].id)?.getAvatarURL();
}
