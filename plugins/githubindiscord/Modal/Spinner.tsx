import { Spinner } from "@primer/react";
import { textClasses } from "../components";

export default ({ children }: { children: string }) => (
  <div className={[textClasses?.["heading-lg/medium"], "fetching"].join(" ")}>
    <span>{children}</span>
    <Spinner size="large" />
  </div>
);
