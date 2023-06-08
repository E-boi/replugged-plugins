import { components, webpack } from "replugged";
import { pluginSettings, updateVars } from ".";
import { useEffect, useState } from "react";

const { FormItem, Slider } = components;

const classes = {
  ...webpack.getByProps("marginBottom20", "marginTop20", "marginTop16"),
} as Record<string, string>;

export default () => {
  const [blurEffect, setBlurEffect] = useState(pluginSettings.get("blurEffect", 10));
  const [blurTiming, setBlurTiming] = useState(pluginSettings.get("blurTiming", 1));

  useEffect(() => {
    pluginSettings.set("blurEffect", blurEffect);
    pluginSettings.set("blurTiming", blurTiming);
    updateVars();
  }, [blurEffect, blurTiming]);

  return (
    <div>
      <FormItem title="Blur Timing (in seconds)" className={classes.marginBottom20}>
        <Slider
          className={classes.marginTop16}
          defaultValue={1}
          initialValue={pluginSettings.get("blurTiming")}
          markers={[0.2, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          stickToMarkers
          onMarkerRender={(marker) => `${marker}s`}
          onValueChange={setBlurTiming}
        />
      </FormItem>

      <FormItem title="Blur effect">
        <Slider
          className={classes.marginTop16}
          stickToMarkers
          defaultValue={10}
          initialValue={pluginSettings.get("blurEffect")}
          markers={[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 65, 60, 70, 75]}
          onMarkerRender={(marker) => `${marker}px`}
          onValueChange={setBlurEffect}
        />
      </FormItem>
    </div>
  );
};
