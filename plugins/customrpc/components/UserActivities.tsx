import { webpack } from "replugged";
import { AnyFunction } from "replugged/dist/types";
import { Scroller, UserActivity } from ".";

const useStateFromStore = webpack.getFunctionBySource(
  webpack.getBySource("useStateFromStores")!,
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
  return (
    <div className={`${classes.profileColors} rprpc-activities`}>
      {Scroller && (
        <Scroller>
          {activities?.map((a) => {
            return (
              UserActivity && (
                <UserActivity
                  activity={a}
                  className="rprpc-activity"
                  source="Profile Modal"
                  type="ProfileV2"
                  useStoreStream={false}
                  user={(user?.getCurrentUser as AnyFunction)()}
                />
              )
            );
          })}
        </Scroller>
      )}
    </div>
  );
};
