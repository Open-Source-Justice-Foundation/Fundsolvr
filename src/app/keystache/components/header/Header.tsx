import { Logo } from "../icons";

export default function Header() {
  return (
    <header className="flex w-full items-center justify-between gap-x-2 border-b border-gray-300 p-4 md:justify-center">
      <Logo className="block md:hidden" />
      <span className="hidden md:block">
        2 easy steps to Implement Keystache for your applications   →{" "}
      </span>
      <a className="text-primary" href="#">
        Documentation
      </a>
    </header>
  );
}
