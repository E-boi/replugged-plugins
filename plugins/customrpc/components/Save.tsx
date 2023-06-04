import { webpack } from "replugged";
import { Notice, SlideIn, TransitionGroup } from ".";

const noticeRegion = webpack.getByProps<{ noticeRegion: string; mobileToolsContainer: string }>(
  "noticeRegion",
  "mobileToolsContainer",
);

export default ({ onReset, onSave }: { onReset: () => void; onSave: () => void }) => {
  return (
    (TransitionGroup && SlideIn && Notice && (
      <TransitionGroup>
        <SlideIn className={noticeRegion?.noticeRegion}>
          <Notice onReset={onReset} onSave={onSave} theme="dark" />
        </SlideIn>
      </TransitionGroup>
    )) ||
    null
  );
};
