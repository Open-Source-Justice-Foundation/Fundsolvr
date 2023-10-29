import Link from "next/link";

import { classNames } from "@/app/lib/utils";

import Badge from "./Badge";
import Avatar from "./Avatar";
import ContactMenuButton from "./ContactMenuButton";

export interface IUser {
  profile: string;
  name: string;
  unread: boolean;
  about: string;
  publicKey: string;
}

interface IContactProps {
  user: IUser;
}

export default function Contact({ user }: IContactProps) {
  const { name, profile, unread, publicKey } = user;
  return (
    <Link href={`/messages/${publicKey}`} className="block rounded-md border border-transparent p-4 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800">
      <div className="group flex items-center gap-4">
        <Avatar className="h-12 w-12" src={profile} />
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-md font-bold">{name}</span>
          <p className={classNames("flex items-center gap-2", unread ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
            <span>You:</span>
            hello from resolvr.io
            <span>·</span>
            <span>42m</span>
          </p>
        </div>
        {unread && <Badge size={2} />}
        <ContactMenuButton className="invisible" />
      </div>
    </Link>
  );
}
