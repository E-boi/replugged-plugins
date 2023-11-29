import { common, webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";
import { userActivity } from ".";
import { Store } from "replugged/dist/renderer/modules/common/flux";

const ActivityStore = webpack.getByStoreName<
  Store & {
    getActivities: (...args: any[]) => unknown[];
    getLocalPresence: AnyFunction;
  }
>("SelfPresenceStore");
const user = webpack.getByProps<{ getCurrentUser: AnyFunction }>("getCurrentUser");

const classes = webpack.getByProps<Record<string, string>>("profileColors");

export default () => {
  if (!ActivityStore || !userActivity) return null;

  const activities = common.flux.useStateFromStores([ActivityStore], () =>
    ActivityStore.getActivities(),
  );

  // just for types using "userActivity.default" component says "userActivity" may be null
  const UserActivity = userActivity.default;

  return (
    <div className={`${classes?.profileColors} rprpc-activities`}>
      {activities?.map((a) => (
        <UserActivity
          activity={a}
          className="rprpc-activity"
          source="Profile Modal"
          type="ProfileV2"
          useStoreStream={false}
          user={user?.getCurrentUser()}
        />
      ))}
    </div>
  );
};
