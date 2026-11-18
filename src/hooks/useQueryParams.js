'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useQueryParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const setParams = useCallback(
    (values, { replace = false } = {}) => {
      const query = new URLSearchParams(values).toString();
      const href = query ? `${pathname}?${query}` : pathname;

      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router],
  );

  return [params, setParams];
}
