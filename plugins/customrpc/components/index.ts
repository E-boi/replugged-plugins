import { FC, ReactNode } from "react";
import { webpack } from "replugged";
import {
  AnyFunction,
  ModuleExports,
  ModuleExportsWithProps,
  ObjectExports,
} from "replugged/dist/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserActivity = webpack.getFunctionBySource<FC<any>>(
  '"activity","user","useStoreStream","showActions","hideHeader"',
  await webpack.waitForModule(
    webpack.filters.bySource('"activity","user","useStoreStream","showActions","hideHeader"'),
  ),
);

const FormItemMod = webpack.getBySource(
  '"children","disabled","className","titleClassName","tag","required","style","title","error"',
);
export const FormItemRaw =
  FormItemMod &&
  Object.values(FormItemMod).find((x) => x?.render?.toString()?.includes("titleClassName"));

const ScrollerMod = webpack.getBySource(
  '"children","className","dir","orientation","paddingFix","fade","onScroll","style"',
);

export const Scroller: undefined | FC<{ children: ReactNode }> =
  (ScrollerMod &&
    Object.values(ScrollerMod).find((x) =>
      x?.render
        ?.toString()
        ?.includes(
          '"children","className","dir","orientation","paddingFix","fade","onScroll","style"',
        ),
    )) ||
  undefined;

export const SelectMenuRaw = webpack.getFunctionBySource<
  FC<{
    className?: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
  }>
>(
  '["value","onChange"]',
  await webpack.waitForModule(webpack.filters.bySource('["value","onChange"]')),
);

export const SlideIn = getFunctionByProto<FC<{ children: ReactNode; className?: string }>>(
  "animateTo",
  await webpack.waitForModule((m) => Boolean(getExportsForProto(m.exports, ["animateTo"]))),
);

export const TransitionGroup = getFunctionByProto<
  FC<{
    children: ReactNode;
  }>
>(
  "performAppear",
  await webpack.waitForModule((m) => Boolean(getExportsForProto(m.exports, ["performAppear"]))),
);

export const Notice = webpack.getBySource("onSaveButtonColor") as FC<{
  onReset: () => void;
  onSave: () => void;
  theme: "dark" | "light";
}>;

export function getExportsForProto<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(m: ModuleExports, props: P[]): T | undefined {
  if (typeof m !== "object") return undefined;
  return Object.values(m).find((o) => {
    return (
      typeof o === "function" && o != null && o.prototype && props.every((p) => p in o.prototype)
    );
  }) as T | undefined;
}

export function getFunctionByProto<T extends AnyFunction = AnyFunction>(
  match: string,
  module: ObjectExports | AnyFunction,
): T | undefined {
  if (typeof module === "function") return module.prototype[match] && module;
  return Object.values(module).find((v) => {
    if (typeof v !== "function") return false;
    return v.prototype[match];
  }) as T | undefined;
}
