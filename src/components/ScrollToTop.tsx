"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Riporta la finestra all'inizio (0,0) ad ogni cambio di percorso
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;