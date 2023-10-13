import { classNames } from "@/app/lib/utils";

interface IChatBubbleProps {
  text: string;
  rtl?: boolean;
}

const ChatBubble = ({ text, rtl }: IChatBubbleProps) => {
  return (
    <div className={classNames("max-w-[85%] bg-gray-800 p-4", rtl ? "rounded-l-lg rounded-tr-lg ml-auto" : "rounded-r-lg rounded-tl-lg mr-auto")}>
      {text}
    </div>
  );
};

export default ChatBubble;
