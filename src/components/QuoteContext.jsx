'use client';

import { createContext, useContext } from 'react';

export const QuoteContext = createContext(null);

export function useQuote() {
  return useContext(QuoteContext);
}
