import React from 'react';
import { Link } from 'react-router-dom';

export default function SurveyButton({ userId, variant = 'link', className = '' }) {
  if (!userId) return null;

  const target = `/user/dashboard/${userId}?onboarding=1`;

  if (variant === 'cta') {
    return (
      <Link
        to={target}
        className={` 
          inline-flex items-center justify-center
          px-5 py-2.5 rounded-full
          bg-[#8C6F52] !text-white text-sm font-semibold uppercase tracking-wide
          hover:bg-[#75593f] transition-colors
          ${className}
        `}
      >
        Refine your taste
      </Link>
    );
  }

  return (
    <Link
      to={target}
      className={`text-md font-medium !text-[#8C6F52] hover:underline ${className}`}
    >
      Refine Taste
    </Link>
  );
}
