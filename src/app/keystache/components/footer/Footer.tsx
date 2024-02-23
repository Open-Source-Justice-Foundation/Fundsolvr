import { Discord, Github, Globe } from "../icons";

export default function Footer() {
  return (
    <footer className="flex w-full flex-row items-center justify-center gap-x-4 p-4 text-[#364C63]">
      <span>FOSS software made with love by Resolvr</span>
      <div className="flex flex-row items-center gap-x-4">
        <a target="_blank" href="https://discord.gg/nMsQRWThaR">
          <Discord />
        </a>
        <a target="_blank" href="https://github.com/Resolvr-io">
          <Github />
        </a>
        <a target="_blank" href="https://resolvr.io/">
          <Globe />
        </a>
      </div>
    </footer>
  );
}
