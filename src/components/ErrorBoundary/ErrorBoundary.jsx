import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught application error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#111827] border-2 border-[#1A4A2A] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1A3A2A] flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-[#FFD700]">系統存取發生異常</h1>
            <p className="text-sm text-[#7DCEA0] leading-relaxed">
              很抱歉，應用程式遇到了非預期的錯誤。您可以嘗試重新整理頁面。
            </p>
            {this.state.error?.message && (
              <pre className="w-full bg-[#0A0E1A] text-red-400 text-xs p-3 rounded-lg overflow-x-auto text-left max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-2 px-6 py-2.5 bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/30 rounded-xl font-semibold transition-all cursor-pointer"
            >
              重新載入頁面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
