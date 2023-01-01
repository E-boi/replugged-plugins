import { webpack } from "replugged";
import { Arrow } from "../../components";

const classes = {
  markup: webpack.getByProps("markup")?.markup,
  scrollbarGhostHairline: webpack.getByProps("scrollbarGhostHairline")?.scrollbarGhostHairline,
};
const parser: any = webpack.getByProps("parse", "parseTopic");

export default ({ file, onClose }: { file: any; onClose: () => void }) => {
  return (
    <>
      <div className="Gpath">
        <Arrow direction="LEFT" onClick={onClose} />
      </div>
      <div className={`${classes.markup} infile`}>
        {file.isImage ? (
          <div className={`Gimg ${classes.scrollbarGhostHairline}`}>
            <img src={file.content} />
          </div>
        ) : (
          parser.defaultRules.codeBlock.react({ content: file.content, lang: file.type }, null, {})
        )}
      </div>
    </>
  );
};
