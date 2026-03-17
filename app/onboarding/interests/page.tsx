import InterestsPicker from "../../components/InterestsPicker";

export default function OnboardingInterestsPage() {
  return (
    <InterestsPicker
      mode="onboarding"
      title="Choose Your Favorite Leagues and Clubs"
      subtitle="Select the teams and leagues you follow so we can personalize your news feed."
      submitLabel="Continue"
    />
  );
}