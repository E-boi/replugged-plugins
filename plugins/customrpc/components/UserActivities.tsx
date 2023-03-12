import { webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";
import { Scroller, UserActivity } from ".";

const useStateFromStoreRaw = await webpack.waitForModule(
  webpack.filters.bySource("useStateFromStores"),
);
const useStateFromStore = webpack.getFunctionBySource(
  useStateFromStoreRaw as ObjectExports,
  "useStateFromStores",
);
const ActivityStore = webpack.getByProps("getActivities");
const user = webpack.getByProps("getCurrentUser");

const classes = {
  ...webpack.getByProps("profileColors"),
};

export default () => {
  const activities = useStateFromStore!([ActivityStore], () =>
    (ActivityStore!.getActivities as AnyFunction)(),
  ) as unknown[];

  if (!Scroller) return null;

  return (
    <div className={`${classes.profileColors} rprpc-activities`}>
      {/* eslint-disable-next-line new-cap */}
      {Scroller({
        children: activities?.map(
          (a) =>
            UserActivity && (
              <UserActivity
                activity={a}
                className="rprpc-activity"
                source="Profile Modal"
                type="ProfileV2"
                useStoreStream={false}
                user={(user?.getCurrentUser as AnyFunction)()}
              />
            ),
        ),
      })}
    </div>
  );
};
