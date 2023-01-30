import { ReactNode } from "react";
import { FormItemRaw } from ".";
import { components, webpack } from "replugged";
const { FormText, Divider, Flex } = components;

interface Props {
  title: string;
  children: ReactNode;
  required?: boolean;
  note?: string;
  className?: string;
  divider?: boolean;
}

const classes = {
  ...webpack.getByProps("labelRow"),
  ...webpack.getByProps("marginBottom20", "marginTop20"),
} as Record<string, string>;

export default ({ children, title, note, required, divider = true }: Props) => (
  <FormItemRaw
    title={title}
    required={required}
    className={`${Flex.Direction.VERTICAL} ${Flex.Justify.START} ${Flex.Align.STRETCH} ${Flex.Wrap.NO_WRAP} ${classes.marginBottom20}`}>
    {children}
    {note && <FormText.DESCRIPTION className={classes.marginTop8}>{note}</FormText.DESCRIPTION>}
    {divider && <Divider className={classes.dividerDefault} />}
  </FormItemRaw>
);
