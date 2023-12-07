import Bounties from "./components/bounties/Bounties";
import Banner from "./components/header/Banner";

export default function Example() {
  return (
    <>
      <Banner />
      <main className="w-full px-4">
        <div className="container mx-auto max-w-7xl flex-col">
          <Bounties />
        </div>
      </main>
    </>
  );
}
