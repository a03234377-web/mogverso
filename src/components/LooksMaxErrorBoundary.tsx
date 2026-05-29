"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

function LooksMaxErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lm-bg p-6 text-center text-lm-text">
      <div>
        <p className="mb-2 text-xl font-bold text-lm-red2">⚠️ Error</p>
        <p className="text-sm text-lm-text2">{message}</p>
      </div>
    </div>
  );
}

export class LooksMaxErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <LooksMaxErrorDisplay message={this.state.error.message} />;
    }
    return this.props.children;
  }
}
