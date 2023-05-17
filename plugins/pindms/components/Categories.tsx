import { ReactElement, useEffect, useState } from "react";
import pluginSettings from "../pluginSettings";
import Category from "./Category";
import { common } from "replugged";
import { CATEGORY_UPDATE } from "../constants";

export default ({ selectedChannelId }: { selectedChannelId: string }): ReactElement => {
  const [categories, setCategories] = useState(pluginSettings.get("categories", []));

  useEffect(() => {
    const update = () => {
      setCategories([...pluginSettings.get("categories", [])]);
    };

    common.fluxDispatcher.subscribe(CATEGORY_UPDATE, update);
    return () => common.fluxDispatcher.unsubscribe(CATEGORY_UPDATE, update);
  });

  return (
    <>
      {categories
        // empty categories or unnamed categories no show
        .filter((c) => c.name && c.ids.length)
        .map((c) => (
          <Category category={c} selected={selectedChannelId} />
        ))}
    </>
  );
};
