import Bounties from "./components/Bounties";
import Sidebar from "./components/Sidebar";
import Header from "./components/header/Header";

export default function Example() {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Bounties />
          </div>
        </main>
      </div>
    </>
  );
}
