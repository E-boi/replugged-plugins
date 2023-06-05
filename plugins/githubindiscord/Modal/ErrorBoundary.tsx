import { PureComponent, ReactNode } from "react";
import { components, webpack } from "replugged";
import { textClasses } from "../components";
import { ModalProps } from "../Modals";
import { Text } from "@primer/react";

const { ModalContent, ModalRoot } = components.Modal;

export default class ErrorBoundary extends PureComponent<
  { children: ReactNode; modalProps: ModalProps },
  { hasErr: boolean; err?: string }
> {
  public constructor(props: { children: ReactNode; modalProps: ModalProps }) {
    super(props);
    this.state = { hasErr: false };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasErr: true, err: error.message };
  }

  public render() {
    if (!this.state.hasErr) return this.props.children;

    return (
      <ModalRoot {...this.props.modalProps} className="githubModel errorModal">
        <ModalContent>
          <div className="Gerror">
            <RandomWumpus tries={0} />
            <Text className={textClasses?.["heading-lg/normal"]} color="var(--text-normal)">
              {this.state.err}
            </Text>
          </div>
        </ModalContent>
      </ModalRoot>
    );
  }
}

const wumpus = [
  webpack.getBySource<string>("b5eb2f7d6b3f8cc9b60be4a5dcf28015"),
  webpack.getBySource<string>("8c998f8fb62016fcfb4901e424ff378b"),
  webpack.getBySource<string>("b36c705f790dad253981f1893085015a"),
];

function RandomWumpus({ tries }: { tries: number }) {
  if (tries > 3) return null;

  const random = Math.floor(Math.random() * wumpus.length);

  if (!wumpus[random]) return <RandomWumpus tries={tries + 1} />;
  else return <img src={wumpus[random]} />;
}
