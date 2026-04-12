"use client";

import React from 'react';
import { useLocation } from 'react-router-dom';
import WordPressPortal from '@/components/WordPressPortal';

const WPPage = () => {
  const location = useLocation();
  const { title, url } = location.state || { title: "Low District", url: "https://www.lowdistrict.it" };

  return <WordPressPortal title={title} url={url} />;
};

export default WPPage;