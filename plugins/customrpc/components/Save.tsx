import { webpack } from "replugged";
import { Notice, SlideIn, TransitionGroup } from ".";

const noticeRegion = webpack.getByProps("noticeRegion", "mobileToolsContainer")
  ?.noticeRegion as string;

export default ({ onReset, onSave }: { onReset: () => void; onSave: () => void }) => {
  return (
    (TransitionGroup && SlideIn && Notice && (
      <TransitionGroup>
        <SlideIn className={noticeRegion}>
          <Notice onReset={onReset} onSave={onSave} theme="dark" />
        </SlideIn>
      </TransitionGroup>
    )) ||
    null
  );
};
