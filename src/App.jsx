import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import WelcomeModal from "./components/Onboarding/WelcomeModal";

import { useOnboarding } from "./context/OnboardingContext";

function AppContent() {
  const location = useLocation();
  const { setIsLoading } = useLoading();
  const { isTourActive } = useOnboarding();

  useEffect(() => {
    // 導覽期間不觸發全螢幕 Loading 鍋子動畫，避免阻擋 Driver.js 引導與手動高亮
    if (isTourActive) return;

    // 路由切換時啟動載入動畫
    setIsLoading(true);

    // Fallback：若頁面沒有主動呼叫 setIsLoading(false)（例如後台靜態頁面），
    // 800ms 後自動關閉，避免 loading 永遠跑不完。
    const fallback = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(fallback);
  }, [location.pathname, setIsLoading, isTourActive]);

  return <Outlet />;
}

export default function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <OnboardingProvider>
          <WelcomeModal />
          <AppContent />
        </OnboardingProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}
