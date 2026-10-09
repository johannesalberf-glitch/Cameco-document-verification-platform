import React from 'react';
import { VerificationSection } from '@/components/VerificationSection';
import { IntroSection } from '@/components/IntroSection';
import { ProcessSection } from '@/components/ProcessSection';
import { SecuritySection } from '@/components/SecuritySection';
import { FaqSection } from '@/components/FaqSection';

export default function HomePage() {
  return (
    <div>
      <VerificationSection />
      <IntroSection />
      <ProcessSection />
      <SecuritySection />
      <FaqSection />
    </div>
  );
}

