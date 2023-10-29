import { DetailedHTMLProps, ImgHTMLAttributes, useId } from "react";

import { classNames } from "@/app/lib/utils";

interface IAvatarProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  /**
   * The seed determines the initial value for the built-in PRNG. With the PRNG you can create the same avatar over and over again based.
   * @see [https://www.dicebear.com/styles/bottts/#options-seed](https://www.dicebear.com/styles/bottts/#options-seed)
   */
  seed?: string;
}

const Avatar = ({ src, seed = "", alt = "avatar", className = "", ...props }: IAvatarProps) => {
  const RANDOM_SEED = useId();
  const BOT_AVATAR_ENDPOINT = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed || RANDOM_SEED}`;

  return (
    <img
      src={src || BOT_AVATAR_ENDPOINT}
      alt={alt}
      draggable="false"
      className={classNames("aspect-square select-none rounded-full object-cover", className)}
      {...props}
    />
  );
};

export default Avatar;
