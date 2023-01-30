import { ReactNode } from "react";
import { components } from "replugged";
import FormItem from "./FormItem";

const { TextInput } = components;

export default (
  props: NonNullable<components.TextInputType["defaultProps"]> & {
    divider?: boolean;
    required?: boolean;
    children?: ReactNode;
    note?: string;
  },
) => {
  const title = props.children;
  return (
    <FormItem
      title={(title as string) || ""}
      divider={props.divider}
      required={props.required}
      note={props.note}>
      <TextInput {...{ ...props, children: undefined }} />
    </FormItem>
  );
};
