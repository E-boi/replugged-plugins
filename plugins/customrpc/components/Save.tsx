import { webpack } from "replugged";
import { TransitionGroup } from ".";
import { FC, PropsWithChildren } from "react";

// waitForModule doesn't resolve in time and the settings page gets funky
let SlideIn: FC<PropsWithChildren<{ className?: string }>> | undefined;
let Notice:
  | FC<{
      onReset: () => void;
      onSave: () => void;
      theme: "dark" | "light";
    }>
  | undefined;

export default ({ onReset, onSave }: { onReset: () => void; onSave: () => void }) => {
  if (!SlideIn) {
    const m = webpack.getBySource('inputRange:[0,1],outputRange:["150%","0%"]');
    if (m) SlideIn = webpack.getFunctionBySource(m, 'inputRange:[0,1],outputRange:["150%","0%"]');
  }
  if (!Notice) {
    Notice = webpack.getBySource("onSaveButtonColor");
  }

  return (
    (Notice && SlideIn && TransitionGroup && (
      <TransitionGroup>
        <SlideIn className="noticeRegion__2779f">
          <Notice onReset={onReset} onSave={onSave} theme="dark" />
        </SlideIn>
      </TransitionGroup>
    )) ||
    null
  );
};
