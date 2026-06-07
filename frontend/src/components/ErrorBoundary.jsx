import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Dashboard render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-[#111827] border border-red-500/30 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-red-400 mb-3">
              Something broke while rendering the dashboard
            </h1>
            <p className="text-gray-300 mb-5 leading-7">
              The page hit a frontend error instead of rendering a blank screen.
              This usually means one panel, chart, or import needs attention.
            </p>
            <pre className="text-sm bg-black/30 border border-gray-800 rounded-2xl p-4 overflow-auto whitespace-pre-wrap break-words text-red-200">
              {this.state.error?.message || "Unknown render error"}
            </pre>
            <button
              className="mt-6 bg-cyan-500 hover:bg-cyan-600 transition px-5 py-3 rounded-xl font-semibold"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
