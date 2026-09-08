'use client';

import { useCallback, useState } from 'react';

/**
 * PDF 생성 API(url)를 호출해 Blob으로 내려받는 훅.
 * 서버가 헤드리스 브라우저로 print 페이지를 렌더해 PDF를 반환한다.
 *
 * @param url      PDF 생성 엔드포인트 (관리: /api/proposals/[id]/pdf, 공개: /api/proposals/public/[slug]/pdf)
 * @param filename 저장 파일명(확장자 .pdf는 자동 부여)
 */
export function usePdfDownload(url: string, filename: string) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setError(null);
    setIsDownloading(true);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        let message = `PDF 생성에 실패했습니다 (${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          /* JSON 파싱 실패는 무시하고 기본 메시지 사용 */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  }, [url, filename]);

  return { download, isDownloading, error };
}
