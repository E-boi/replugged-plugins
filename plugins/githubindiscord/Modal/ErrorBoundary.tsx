import { PureComponent, ReactNode } from "react";
import { components } from "replugged";
import { textClasses, wumpus } from "../components";
import { ModalProps } from "../Modals";

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
            <div className={wumpus.emptyStateImage as string} />
            <span
              className={[textClasses?.["heading-lg/normal"], `${wumpus.emptyStateSubtext}`].join(
                " ",
              )}>
              {this.state.err}
            </span>
          </div>
        </ModalContent>
      </ModalRoot>
    );
  }
}
