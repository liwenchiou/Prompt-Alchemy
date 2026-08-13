import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import { createTourSteps } from '../config/tourSteps';
import { getPublishedPrompts } from '../api/promptApi';
import { getAgentSkills } from '../api/agentSkillApi';
import useAuth from '../hooks/useAuth';

const STORAGE_KEY = 'prompt_alchemy_onboarding_v1';
const ACTIVE_STEP_KEY = 'prompt_alchemy_tour_active_step';

const OnboardingContext = createContext(null);

// 輔助函式：輪詢等待 DOM 元素出現且具有實際尺寸（最多等待 maxTries * interval ms）
// 找不到或超時後仍呼叫 callback(null)，讓 driver.js 以 body-centered 繼續
function waitForElement(selector, callback, maxTries = 50, interval = 100) {
  let tries = 0;
  const check = () => {
    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      // 元素必須實際占有空間（非空尺寸）且非 display:none 才算渲染完成
      const isRendered = rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
      if (isRendered) {
        callback(el);
        return;
      }
    }
    if (tries < maxTries) {
      tries++;
      setTimeout(check, interval);
    } else {
      console.warn(`[Onboarding] 元素未渲染完成或不存在: ${selector}，以 body-centered 繼續指引`);
      callback(null);
    }
  };
  check();
}

function ensureBulkInstallOpen(callback) {
  const copyBtn = document.querySelector('[data-tour="bulk-install-copy-btn"]');
  if (copyBtn) {
    const rect = copyBtn.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && copyBtn.offsetParent !== null) {
      if (callback) callback(copyBtn);
      return;
    }
  }
  const bulkBtn = document.querySelector('[data-tour="bulk-install-btn"]');
  if (bulkBtn) {
    bulkBtn.click();
  }
  waitForElement('[data-tour="bulk-install-copy-btn"]', (el) => {
    if (callback) callback(el);
  }, 50, 100);
}

// 輔助函式：比較步驟路由與目前 location.pathname（自動消除 Vite /Prompt-Alchemy/ basename 差異）
function isSameRoute(stepRoute, currentPath) {
  if (!stepRoute) return true;
  const pathWithoutBase = currentPath.replace(/^\/Prompt-Alchemy/, '');
  const normCurrent = pathWithoutBase.replace(/\/$/, '') || '/';
  const normStep = stepRoute.replace(/\/$/, '') || '/';
  return normCurrent === normStep;
}

export function OnboardingProvider({ children }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationRef = useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const driverInstanceRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // 僅登入後才自動彈出 Welcome Modal
  useEffect(() => {
    if (!user) return; // 未登入，不自動彈出
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setHasSeenOnboarding(false);
      // 延遲 600ms 讓首頁加載
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.removeItem(ACTIVE_STEP_KEY);
    setHasSeenOnboarding(false);
    setIsTourActive(false);
    if (!isSameRoute('/', locationRef.current)) {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [navigate]);

  const startTour = useCallback((startIndex = 0) => {
    const stepIdx = typeof startIndex === 'number' ? startIndex : 0;
    setIsWelcomeOpen(false);
    setIsTourActive(true);
    localStorage.setItem(ACTIVE_STEP_KEY, stepIdx.toString());

    // 若先前已有 driver 實例，先銷毀以防重疊
    if (driverInstanceRef.current) {
      isNavigatingRef.current = true;
      try {
        driverInstanceRef.current.destroy();
      } catch (e) {
        // ignore
      }
      isNavigatingRef.current = false;
    }

    const steps = createTourSteps();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      allowHTML: true,
      doneBtnText: '完成導覽 🎉',
      nextBtnText: '下一步 ➔',
      prevBtnText: '❮ 上一步',
      progressText: '步驟 {{current}} / {{total}}',
      steps,
      onNextClick: (element, step, { config, state }) => {
        const currentStepIndex = driverObj.getActiveIndex() ?? 0;
        const currentStepConfig = steps[currentStepIndex];
        const nextStepIndex = currentStepIndex + 1;
        const nextStepConfig = steps[nextStepIndex];

        if (!nextStepConfig) {
          localStorage.removeItem(ACTIVE_STEP_KEY);
          driverObj.destroy();
          return;
        }

        const currentPath = locationRef.current;
        const targetRoute =
          currentStepConfig?.targetRoute ||
          (nextStepConfig.route && !isSameRoute(nextStepConfig.route, currentPath)
            ? nextStepConfig.route
            : null);

        // 如果下一步需要跨頁切換路由
        if (targetRoute && !isSameRoute(targetRoute, currentPath)) {
          isNavigatingRef.current = true;
          localStorage.setItem(ACTIVE_STEP_KEY, nextStepIndex.toString());
          driverObj.destroy();
          navigate(targetRoute);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }

        // 同頁面跳轉
        if (nextStepConfig.element === '[data-tour="bulk-install-copy-btn"]') {
          ensureBulkInstallOpen(() => {
            driverObj.moveNext();
          });
        } else {
          driverObj.moveNext();
        }
      },

      onPrevClick: (element, step, { config, state }) => {
        const currentStepIndex = driverObj.getActiveIndex() ?? 0;
        const prevStepIndex = currentStepIndex - 1;
        const prevStepConfig = steps[prevStepIndex];

        if (!prevStepConfig) {
          driverObj.movePrevious();
          return;
        }

        const currentPath = locationRef.current;
        if (prevStepConfig.route && !isSameRoute(prevStepConfig.route, currentPath)) {
          isNavigatingRef.current = true;
          localStorage.setItem(ACTIVE_STEP_KEY, prevStepIndex.toString());
          driverObj.destroy();
          navigate(prevStepConfig.route);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }

        if (prevStepConfig.element === '[data-tour="bulk-install-copy-btn"]') {
          ensureBulkInstallOpen(() => {
            driverObj.movePrevious();
          });
        } else {
          driverObj.movePrevious();
        }
      },

      onDestroyed: () => {
        driverInstanceRef.current = null;
        // 若為路由切換造成的 destroy()，不結束 Onboarding
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
          return;
        }

        // 使用者點擊關閉或完成時清理狀態
        localStorage.removeItem(ACTIVE_STEP_KEY);
        setIsTourActive(false);
        completeOnboarding();
      },
    });

    driverInstanceRef.current = driverObj;
    const targetElement = steps[stepIdx]?.element;
    if (targetElement) {
      if (targetElement === '[data-tour="bulk-install-copy-btn"]') {
        ensureBulkInstallOpen(() => {
          try {
            driverObj.drive(stepIdx);
          } catch (err) {
            console.error('[Onboarding] Error during driver.drive():', err);
          }
        });
        return;
      }
      // 等元素實際渲染完成（有實際尺寸）再啟動，最多等 5 秒
      waitForElement(targetElement, () => {
        try {
          driverObj.drive(stepIdx);
        } catch (err) {
          console.error('[Onboarding] Error during driver.drive():', err);
        }
      }, 50, 100);
    } else {
      driverObj.drive(stepIdx);
    }
  }, [completeOnboarding, navigate]);

  // 監聽路由變化，若有未完成的跨頁步驟則恢復指引
  useEffect(() => {
    const savedStep = localStorage.getItem(ACTIVE_STEP_KEY);
    // 如果已有驅動中實例，避開重複啟動
    if (savedStep !== null && !driverInstanceRef.current) {
      const stepIndex = parseInt(savedStep, 10);
      const steps = createTourSteps();
      const targetStep = steps[stepIndex];

      if (targetStep) {
        const targetRoute = targetStep.route || '/';
        if (isSameRoute(targetRoute, location.pathname)) {
          if (targetStep.element === '[data-tour="bulk-install-copy-btn"]') {
            ensureBulkInstallOpen(() => {
              if (!driverInstanceRef.current) {
                startTour(stepIndex);
              }
            });
            return;
          }

          let cancelled = false;
          waitForElement(targetStep.element, () => {
            if (!cancelled && !driverInstanceRef.current) {
              startTour(stepIndex);
            }
          }, 50, 100);
          return () => { cancelled = true; };
        }
      }
    }
  }, [location.pathname, startTour]);

  const closeWelcomeModal = useCallback(() => {
    setIsWelcomeOpen(false);
    setIsTourActive(false);
    localStorage.removeItem(ACTIVE_STEP_KEY);
    completeOnboarding();
  }, [completeOnboarding]);

  const replayTour = useCallback(() => {
    setIsWelcomeOpen(false);
    setIsTourActive(true);
    localStorage.removeItem(ACTIVE_STEP_KEY);

    if (driverInstanceRef.current) {
      isNavigatingRef.current = true;
      try {
        driverInstanceRef.current.destroy();
      } catch (e) {
        // ignore
      }
      isNavigatingRef.current = false;
    }

    if (locationRef.current !== '/') {
      isNavigatingRef.current = true;
      navigate('/');
      setTimeout(() => {
        startTour(0);
      }, 300);
    } else {
      startTour(0);
    }
  }, [navigate, startTour]);

  return (
    <OnboardingContext.Provider
      value={{
        hasSeenOnboarding,
        isWelcomeOpen,
        isTourActive,
        setIsWelcomeOpen,
        startTour,
        closeWelcomeModal,
        replayTour,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
