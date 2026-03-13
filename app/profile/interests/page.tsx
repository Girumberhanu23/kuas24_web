import InterestsPicker from "../../components/InterestsPicker";

export default function ProfileInterestsPage() {
  return (
    <InterestsPicker
      mode="profile"
      title="Manage Your Interests"
      subtitle="Update the leagues and clubs that shape the stories you see first."
      submitLabel="Update Interests"
    />
  );
}