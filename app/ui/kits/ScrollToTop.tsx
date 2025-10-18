"use client";

import { useEffect } from 'react';

export default function ScrollToTop() {
  useEffect(() => {
    return () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }, []);

  return null;
}