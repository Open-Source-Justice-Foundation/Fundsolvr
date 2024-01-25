import BackButton from "./BackButton";

export default function InvalidNaddr() {
  return (
    <div className="mt-4">
      <BackButton />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-2xl font-bold">Invalid Bounty Address</div>
      </div>
    </div>
  );
}
