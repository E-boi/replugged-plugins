import { Box, SubNav, Text } from "@primer/react";
import { TagIcon } from "@primer/styled-octicons";
import { useState } from "react";
import { TabProps } from ".";

export default (props: TabProps) => {
  const [tab, setTab] = useState<string>("tags");

  return (
    <div>
      <SubNav aria-label="Releases and Tags" sx={{ marginBottom: 3 }}>
        <SubNav.Links>
          <SubNav.Link selected={tab === "releases"} onClick={() => setTab("releases")}>
            Releases
          </SubNav.Link>
          <SubNav.Link selected={tab === "tags"} onClick={() => setTab("tags")}>
            Tags
          </SubNav.Link>
        </SubNav.Links>
      </SubNav>
      {tab === "tags" && <TagsTab {...props} />}
    </div>
  );
};

function TagsTab({ tags }: TabProps) {
  // const [tags, setTags] = useState<components["schemas"]["tag"][] | null>(null);

  // useEffect(() => {
  //   (async () => setTags(await getTags(url)))();
  // }, []);

  // if (!tags)
  //   return (
  //     <div>
  //       <p>Fetching Tags...</p>
  //       <Spinner size="medium" />
  //     </div>
  //   );
  console.log(tags);
  return (
    <Box borderWidth={1} borderColor="border.default" borderStyle="solid" borderRadius={2}>
      <Box
        p={3}
        // borderColor="border.default"
        // borderStyle="solid"
        borderTopLeftRadius={6}
        borderTopRightRadius={6}
        bg="canvas.subtle"
        display="flex">
        <Text fontWeight="bold">
          <TagIcon /> Tags
        </Text>
      </Box>
      {tags.map((t) => (
        <Box p={3} borderTopWidth={1} borderColor="border.muted" borderStyle="solid">
          <Text>{t.name}</Text>
        </Box>
      ))}
    </Box>
  );
}
