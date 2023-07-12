import { useEffect, useState } from "react";
import { common, components, util } from "replugged";
import pluginSettings, { Category } from "./pluginSettings";
import { CATEGORY_UPDATE, GUILDLIST_UPDATE } from "./constants";

const { useSetting } = util;

const CategorySetting = ({
  category,
  onChange,
  onDelete,
}: {
  category: Category;
  onChange: (category: Category) => void;
  onDelete: (category: Category) => void;
}) => {
  return (
    <div style={{ display: "flex", margin: "5px 0px 5px 0px" }}>
      <components.TextInput
        value={category.name}
        placeholder="Category Name"
        onChange={(value) => {
          category.name = value;
          onChange(category);
        }}
      />
      <components.Button color={components.Button.Colors.RED} onClick={() => onDelete(category)}>
        Delete
      </components.Button>
    </div>
  );
};

export default () => {
  const [categories, setCategories] = useState<Category[]>(pluginSettings.get("categories", []));
  const [showStatus, setShowStatus] = useState(pluginSettings.get("showStatus", true));

  useEffect(() => {
    pluginSettings.set("categories", categories);
    common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
  }, [JSON.stringify(categories)]);

  useEffect(() => {
    pluginSettings.set("showStatus", showStatus);
    common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
  }, [showStatus]);

  return (
    <div>
      <components.SwitchItem value={showStatus} onChange={(value) => setShowStatus(value)}>
        Show status on server list pins
      </components.SwitchItem>
      {categories.map((cat) => (
        <CategorySetting
          category={cat}
          onChange={(cat) => {
            const idx = categories.findIndex((c) => c.id === cat.id);
            if (idx === -1) return;

            categories.splice(idx, 1, cat);
            setCategories([...categories]);
          }}
          onDelete={(cat) => {
            const idx = categories.findIndex((c) => c.id === cat.id);
            if (idx === -1) return;

            categories.splice(idx, 1);
            setCategories([...categories]);
          }}
        />
      ))}

      <components.Button
        onClick={() => {
          categories.push({
            id: common.lodash.uniqueId("cat-"),
            ids: [],
            name: "",
            collapsed: false,
          });
          setCategories([...categories]);
        }}>
        Add Category
      </components.Button>
    </div>
  );
};
