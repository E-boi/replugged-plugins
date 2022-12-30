enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
}

export enum ModalSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  DYNAMIC = "dynamic",
}

export type ModalProps<T = {}> = {
  [K in keyof T]: T[K];
} & { transitionState: ModalTransitionState; onClose(): Promise<void> };
