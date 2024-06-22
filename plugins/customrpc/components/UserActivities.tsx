import { common, webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";
import { UserActivity } from ".";
import { Store } from "replugged/dist/renderer/modules/common/flux";
import { User } from "discord-types/general";

const UserStore = webpack.getByStoreName<Store & { getCurrentUser: () => User }>("UserStore");
// const user = webpack.getByProps<{ getCurrentUser: AnyFunction }>("getCurrentUser");

const classes = webpack.getByProps<Record<string, string>>("profileColors");

export default () => {
  if (!UserActivity) return null;

  const user = UserStore!.getCurrentUser();

  return (
    <div>
      <UserActivity user={user} type="ProfileV2" />
    </div>
  );
};
