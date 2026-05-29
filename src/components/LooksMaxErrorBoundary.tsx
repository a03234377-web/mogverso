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
    <div className="flex min-h-screen items-center justify-center bg-[#07090f] p-6 text-center text-[#f0ece0]">
      <div>
        <p className="mb-2 text-xl font-bold text-[#ff4757]">⚠️ Error</p>
        <p className="text-sm text-[#8a8070]">{message}</p>
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
