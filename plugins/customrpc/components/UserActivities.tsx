import { webpack } from "replugged";
import { AnyFunction } from "replugged/dist/types";
import { Scroller, UserActivity } from ".";

const useStateFromStore = webpack.getFunctionBySource(
  "useStateFromStores",
  webpack.getBySource("useStateFromStores")!,
);
const ActivityStore = webpack.getByProps("getActivities");
const user = webpack.getByProps("getCurrentUser");

export default () => {
  const activities = useStateFromStore!([ActivityStore], () =>
    (ActivityStore!.getActivities as AnyFunction)(),
  ) as unknown[];
  return (
    <div className="profileColors-3Y0XaR activities">
      {Scroller && (
        <Scroller>
          {activities?.map((a) => {
            return (
              UserActivity && (
                <UserActivity
                  activity={a}
                  className="userProfileActivity-1JPDhh"
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
