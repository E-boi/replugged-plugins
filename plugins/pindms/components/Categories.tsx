import { ReactElement, useEffect, useState } from "react";
import pluginSettings from "../pluginSettings";
import Category from "./Category";
import { common } from "replugged";
import { CATEGORY_UPDATE } from "../constants";

export default ({ selectedChannelId }: { selectedChannelId: string }): ReactElement => {
  const [categories, setCategories] = useState(pluginSettings.get("categories", []));

  useEffect(() => {
    const update = (data: { refresh?: boolean }) => {
      if (data.refresh) {
        setCategories([]);
        setTimeout(() => setCategories([...pluginSettings.get("categories", [])]));
      } else {
        setCategories([...pluginSettings.get("categories", [])]);
      }
    };

    // @ts-expect-error types
    common.fluxDispatcher.subscribe(CATEGORY_UPDATE, update);
    // @ts-expect-error types
    return () => common.fluxDispatcher.unsubscribe(CATEGORY_UPDATE, update);
  }, []);

  return (
    <>
      {categories
        // empty categories or unnamed categories no show
        .map((c) => (
          <Category category={c} selected={selectedChannelId} />
        ))}
    </>
  );
};
