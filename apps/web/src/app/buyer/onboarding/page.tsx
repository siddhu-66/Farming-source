import BuyerOnboardingWizard from "@/components/buyer/onboarding/BuyerOnboardingWizard";

// For Next.js 13+ App Router, this should be a protected route.
// Depending on your auth implementation (e.g. NextAuth, Clerk), you would wrap or check auth here.

export const metadata = {
  title: "Buyer Onboarding | AgriAssist",
  description: "Complete your buyer profile to start procuring through AgriAssist",
};

export default function BuyerOnboardingPage() {
  return (
    <main className="min-h-screen bg-background">
      <BuyerOnboardingWizard />
    </main>
  );
}
