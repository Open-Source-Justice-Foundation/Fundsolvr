import { classNames } from "@/app/lib/utils";

interface IAvatarProps {
  src: string;
  alt?: string;
  verified?: boolean;
}

const Avatar = ({ src, alt = "", verified }: IAvatarProps) => {
  return (
    <div className={classNames("relative", "h-12 w-12")}>
      <img src={src} alt={alt} className="aspect-square w-full rounded-full" />
      {verified && (
        <svg
          className="absolute bottom-1 right-1 w-6 translate-x-1/2 translate-y-1/2"
          viewBox="-4 0 27 19"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="fill-sky-500"
            d="M7.844 17.563c1.039 1.046 2.031 1.039 3.078 0l1.172-1.172c.11-.11.203-.141.344-.141h1.656c1.476 0 2.18-.703 2.18-2.18v-1.656c0-.14.038-.242.14-.344l1.172-1.18c1.047-1.038 1.039-2.03 0-3.07l-1.172-1.172a.454.454 0 0 1-.14-.343V4.648c0-1.476-.704-2.18-2.18-2.18h-1.656a.443.443 0 0 1-.344-.14l-1.172-1.172C9.875.11 8.882.11 7.844 1.164L6.672 2.328a.443.443 0 0 1-.344.14H4.672c-1.477 0-2.18.688-2.18 2.18v1.657c0 .14-.039.242-.14.343L1.18 7.82c-1.047 1.04-1.04 2.032 0 3.07l1.172 1.18c.101.102.14.203.14.344v1.656c0 1.477.703 2.18 2.18 2.18h1.656c.14 0 .234.031.344.14l1.172 1.172Zm.242-4.204a.883.883 0 0 1-.664-.28l-2.5-2.798a.778.778 0 0 1-.203-.531c0-.469.336-.805.82-.805.266 0 .461.086.633.274l1.883 2.101 3.765-5.375c.188-.265.39-.375.703-.375.485 0 .829.336.829.79a.936.936 0 0 1-.18.515l-4.383 6.148a.831.831 0 0 1-.703.336Z"
          />
        </svg>
      )}
    </div>
  );
};

export default Avatar;
