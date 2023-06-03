import { webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";
import { UserActivity } from ".";

const useStateFromStoreRaw = await webpack.waitForModule(
  webpack.filters.bySource("useStateFromStores"),
);
const useStateFromStore: ((stores: unknown[], callback: () => unknown) => unknown[]) | undefined =
  webpack.getFunctionBySource(useStateFromStoreRaw as ObjectExports, "useStateFromStores");
const ActivityStore = webpack.getByProps<{
  getActivities: AnyFunction;
  getLocalPresence: AnyFunction;
}>("getLocalPresence", "getActivities");
const user = webpack.getByProps<{ getCurrentUser: AnyFunction }>("getCurrentUser");

const classes = webpack.getByProps<Record<string, string>>("profileColors");

export default () => {
  if (!useStateFromStore || !ActivityStore) return null;

  const activities = useStateFromStore([ActivityStore], () => ActivityStore.getActivities());

  return (
    <div className={`${classes?.profileColors} rprpc-activities`}>
      {activities?.map(
        (a) =>
          UserActivity && (
            <UserActivity
              activity={a}
              className="rprpc-activity"
              source="Profile Modal"
              type="ProfileV2"
              useStoreStream={false}
              user={user?.getCurrentUser()}
            />
          ),
      )}
    </div>
  );
};
