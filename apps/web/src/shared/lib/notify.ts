/**
 * 브라우저 알림(Web Notifications) 헬퍼.
 *
 * AI 정제처럼 오래 걸리는 요청이 끝났을 때, 사용자가 다른 탭을 보고 있어도
 * 완료 사실을 알리기 위해 사용한다. 권한이 없거나 지원되지 않는 환경에서는
 * 조용히 무시한다(기능 저하 없이 폴백).
 */

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * 알림 권한을 확보한다. 브라우저 정책상 사용자 제스처(클릭 등) 컨텍스트에서
 * 호출해야 프롬프트가 정상적으로 노출된다.
 */
export async function ensureNotifyPermission(): Promise<NotificationPermission> {
  if (!canNotify()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

interface NotifyOptions extends NotificationOptions {
  /** 탭이 이미 보이는 상태면 알림을 생략한다(불필요한 중복 방지). */
  onlyWhenHidden?: boolean;
}

/** 권한이 granted일 때만 알림을 띄운다. 클릭하면 해당 탭으로 포커스를 되돌린다. */
export function notify(title: string, options?: NotifyOptions): void {
  if (!canNotify() || Notification.permission !== 'granted') return;
  if (
    options?.onlyWhenHidden &&
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible'
  ) {
    return;
  }
  try {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    /* 일부 브라우저는 SW 없이 Notification 생성 시 예외를 던진다 — 무시 */
  }
}
