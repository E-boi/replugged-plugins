import { useEffect, useState } from "react";
import { common, components } from "replugged";
import pluginSettings, { Category } from "./pluginSettings";
import { CATEGORY_UPDATE } from "./constants";

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

  useEffect(() => {
    pluginSettings.set("categories", categories);
    common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
  }, [JSON.stringify(categories)]);

  return (
    <div>
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
            id: window._.uniqueId("cat-"),
            ids: [],
            name: "",
            position: categories.length,
            collapsed: false,
          });
          setCategories([...categories]);
        }}>
        Add Category
      </components.Button>
    </div>
  );
};
