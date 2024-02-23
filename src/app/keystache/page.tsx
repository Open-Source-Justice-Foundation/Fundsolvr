import { Button } from "~/components/ui/button";
import { Check } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import {
  AppleLogo,
  Bitcoin,
  Computer,
  Eagle,
  Keys,
  Logo,
  Penguin,
  Play,
  Shield,
} from "./components/icons";

const inter = Inter({ subsets: ["latin"] });

const features = [
  {
    title: "Secure single sign on",
    description:
      "Keep your nostr keys safe in one place when you sign in to desktops apps",
  },
  {
    title: "Multi-account management",
    description: "create and manage multiple nostr keys with ease",
  },
  {
    title: "Seamless payments",
    description: "Zaps and lightning support with nostr wallet connect",
  },
];

export default function Page() {
  return (
    <div
      className={`min-w-screen relative z-10 flex h-full min-h-screen w-full flex-col justify-between bg-white text-black ${inter.className}`}
    >
      <Header />
      <div className="m-auto my-8 items-center justify-center p-4 text-center">
        <div className="m-auto flex max-w-screen-md flex-col gap-y-4">
          <div className="flex flex-row items-center justify-center gap-x-2">
            <Logo /> <h1 className="text-2xl">Keystache</h1>
          </div>

          <h2 className="text-4xl font-semibold md:text-5xl">
            Your sovereign desktop companion for nostr applications
          </h2>

          <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
            <div className="flex flex-col gap-x-2 gap-y-2 md:flex-row">
              <a href="/Keystache_0.0.0_aarch64.dmg" download>
                <Button className="m-auto self-start p-6">
                  <AppleLogo />
                  <span className="ml-2">Download for Mac</span>
                </Button>
              </a>
              <Link href="/keystache/demo">
                <Button className="m-auto self-start bg-[#FD865F] p-6 hover:bg-[#fd6c3d]">
                  <Play />
                  <span className="ml-2">Watch Demo</span>
                </Button>
              </Link>
            </div>
            <div className="text-xs text-muted">Coming soon to Windows</div>
          </div>
        </div>
        <div className="m-auto mt-10 flex max-w-md flex-col gap-y-6">
          {features.map((feature, i) => (
            <div className="flex flex-row text-left" key={i}>
              <Check className="mr-2 shrink-0 text-primary" />
              <div className="flex-auto">
                <span className="font-bold">{feature.title}</span>{" "}
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <div className="absolute bottom-0 -z-10 hidden h-screen w-full md:block">
        <Eagle className="absolute bottom-40" />
        <Bitcoin className="absolute bottom-0" />
        <Shield className="absolute bottom-0" />
        <Penguin className="absolute bottom-36 right-0" />
        <Computer className="absolute bottom-0 right-0" />
        <Keys className="absolute bottom-0 right-0" />
      </div>
    </div>
  );
}
