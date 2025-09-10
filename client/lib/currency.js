import React, { createContext, useContext, useMemo, useState } from 'react';

const CurrencyContext = createContext(null);

const RATES = {
  JPY: 1,
  USD: 0.0067,
  KRW: 9.5,
  EUR: 0.0061,
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('JPY');
  const value = useMemo(() => ({
    currency,
    setCurrency,
    format: (amountJPY) => {
      const rate = RATES[currency] ?? 1;
      const value = amountJPY * rate;
      const opts = { style: 'currency', currency };
      if (currency === 'JPY' || currency === 'KRW') {
        opts.maximumFractionDigits = 0;
      }
      return new Intl.NumberFormat(undefined, opts).format(value);
    },
  }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

