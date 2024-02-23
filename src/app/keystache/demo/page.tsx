import { Button } from "~/components/ui/button";
import { Inter } from "next/font/google";
import Link from "next/link";

import Footer from "../components/footer/Footer";
import { AppleLogo, Logo, One, Three, Two } from "../components/icons";
import Thumbnail from "../components/video/Thumbnail";
import Video from "../components/video/Video";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <div
      className={`min-w-screen relative z-10 flex h-full min-h-screen w-full flex-col justify-between bg-white text-black ${inter.className}`}
    >
      <div className="m-auto flex h-full min-h-screen w-full max-w-screen-lg flex-col justify-between">
        <header className=" w-full p-4">
          <Link className="flex w-full items-center gap-x-2 " href="/keystache">
            <Logo />
            <h1>Keystache</h1>
          </Link>
        </header>
        <div className="my-6 justify-center p-4">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-row items-center justify-center gap-x-2"></div>

            <h2 className="text-4xl font-semibold md:text-5xl">
              Test Keystache in three easy steps
            </h2>

            <div className="mt-4 flex flex-col items-center justify-center gap-y-6">
              <div className="w-full max-w-screen-lg">
                <Video />
              </div>
              <div className="flex flex-col items-stretch gap-x-2 gap-y-4 md:flex-row">
                <div className="flex flex-1 flex-row items-stretch  gap-x-2">
                  <div className="mt-[4px]">
                    <One />
                  </div>
                  <div className="flex flex-col gap-y-4">
                    <div>
                      <span className="font-bold">Setup Keystache</span> click
                      on Keystache for Mac to download, setup your password and
                      import your account with your private key
                    </div>
                    <a href="/Keystache_0.0.0_aarch64.dmg" download>
                      <Button className="self-start p-6">
                        <AppleLogo />
                        <span className="ml-2">Keystache for Mac</span>
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="flex flex-1 flex-row items-stretch gap-x-2">
                  <div className="mt-[4px]">
                    <Two />
                  </div>
                  <div className="flex flex-col items-stretch justify-between gap-y-4">
                    <div>
                      <span className="font-bold">Setup Resolvr</span> click on
                      Resolvr for Mac to download
                    </div>
                    <a href="/Resolvr_Desktop_0.0.0_aarch64.dmg" download>
                      <Button className="self-start bg-[#FD865F] p-6 hover:bg-[#fd6c3d]">
                        <AppleLogo />
                        <span className="ml-2">Resolvr for Mac</span>
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="flex flex-1 flex-row items-start justify-start gap-x-2">
                  <div className="mt-[4px]">
                    <Three />
                  </div>
                  <div>
                    <span className="font-bold">Sign in to Resolvr</span> click
                    on sign in with Keystache, a dialog modal of Keystache will
                    be prompted, click on confirm to sign in, you can continue
                    to test out the app by approving zaps and events with
                    Keystache.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
