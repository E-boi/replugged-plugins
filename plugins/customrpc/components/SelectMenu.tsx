import { ReactNode } from "react";
import { components, webpack } from "replugged";
import { SelectMenuRaw } from ".";
import FormItem from "./FormItem";
const { Flex } = components;

const classes = {
  ...webpack.getByProps("marginBottom20", "marginTop20"),
} as Record<string, string>;

export default (props: {
  children?: ReactNode[];
  required?: boolean;
  className?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  divider?: boolean;
  onChange: (value: string) => void;
}) => {
  if (!SelectMenuRaw) return null;

  if (!Array.isArray(props.children)) props.children = [props.children];
  const title = props.children[0] as string;
  props.children.splice(0, 1);
  const others = props.children.map(
    (c) =>
      c && (
        <Flex.Child className="rprpc-lowerMargin" grow={0} shrink={0} wrap>
          {c}
        </Flex.Child>
      ),
  );
  return (
    <FormItem
      divider={props.divider ?? true}
      title={title}
      className={classes.marginBottom20}
      required={props.required}>
      {others.length ? (
        <Flex>
          <Flex.Child grow={1} shrink={1} wrap>
            <SelectMenuRaw {...{ ...props, children: undefined }} />
          </Flex.Child>
          {[...others]}
        </Flex>
      ) : (
        <SelectMenuRaw {...{ ...props, children: undefined }} />
      )}
    </FormItem>
  );
};
