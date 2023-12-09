import { ReactNode } from "react";

interface IMessagesLayoutProps {
  children: ReactNode;
}

const MessagesLayout = ({ children }: IMessagesLayoutProps) => (
  <div className="mx-auto flex min-h-screen w-full items-start justify-center pb-20 pt-10 text-sm text-gray-900 antialiased dark:text-white">
    <div className="mx-auto w-full max-w-3xl rounded-md border border-gray-400 p-4 dark:border-darkBorder">{children}</div>
  </div>
);

export default MessagesLayout;
