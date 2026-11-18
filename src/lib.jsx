'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
export async function api(path, options = {}) {
  const response = await fetch('/api' + path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => {
    return {
      message: 'Không thể kết nối máy chủ.',
    };
  });
  if (!response.ok) {
    const error = new Error(data.message || 'Đã xảy ra lỗi.');
    error.status = response.status;
    throw error;
  }
  return data;
}
export const money = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);
};
export const number = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0);
};
export const date = (value) => {
  return new Date(value).toLocaleDateString('vi-VN');
};
export const categories = ['Tất cả', 'Thép xây dựng', 'Thép hình', 'Thép hộp & ống', 'Thép tấm'];
export const orderStatuses = {
  new: 'Đơn mới',
  confirmed: 'Đã xác nhận',
  delivering: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};
export const quoteStatuses = {
  new: 'Chưa liên hệ',
  contacted: 'Đã liên hệ',
  completed: 'Đã xử lý',
};
const SiteContext = createContext(null);
const ToastContext = createContext(null);
export const useSite = () => {
  return useContext(SiteContext);
};
export const useToast = () => {
  return useContext(ToastContext);
};
export function Providers({ children, initialSettings = null, initialProducts = [] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const refresh = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([api('/public/settings'), api('/public/products')]);
      setSettings(s);
      setProducts(p);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    // The root layout already provides a fresh server snapshot on page load.
    // Fetch only for consumers that were mounted without that snapshot.
    if (initialSettings === null) {
      refresh();
    }
  }, [initialSettings, refresh]);
  const toast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => {
      return [
        ...t,
        {
          id,
          message,
          type,
        },
      ];
    });
    setTimeout(() => {
      return setToasts((t) => {
        return t.filter((x) => {
          return x.id !== id;
        });
      });
    }, 5500);
  }, []);
  return (
    <SiteContext.Provider
      value={{
        settings,
        products,
        error,
        refresh,
      }}
    >
      <ToastContext.Provider value={toast}>
        {children}
        <div className="toast-stack" aria-live="polite">
          {toasts.map((t) => {
            return (
              <div className={'toast ' + t.type} key={t.id}>
                {t.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <span>{t.message}</span>
                <button
                  aria-label="Đóng thông báo"
                  onClick={() => {
                    return setToasts((a) => {
                      return a.filter((x) => {
                        return x.id !== t.id;
                      });
                    });
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            );
          })}
        </div>
      </ToastContext.Provider>
    </SiteContext.Provider>
  );
}
export function exportCSV(filename, headers, rows) {
  const escape = (v) => {
    return (
      '"' +
      String(v ?? '')
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"'
    );
  };
  const csv =
    '\uFEFF' +
    [headers, ...rows]
      .map((r) => {
        return r.map(escape).join(',');
      })
      .join('\r\n');
  const url = URL.createObjectURL(
    new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => {
    return URL.revokeObjectURL(url);
  }, 1000);
}
