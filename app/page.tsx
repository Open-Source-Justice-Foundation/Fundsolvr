import Bounties from "./components/bounties/Bounties";
import Banner from "./components/header/Banner";

export default function Example() {
  return (
    <>
      <Banner />
      <main className="container mx-auto flex max-w-7xl flex-col px-4">
        <Bounties />
      </main>
    </>
  );
}
