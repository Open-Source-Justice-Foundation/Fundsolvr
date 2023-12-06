interface Props {
  width?: number;
  height?: number;
  className?: string;
}
export default function DiscordIcon(props: Props) {
  const { width, height, className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? `${width}` : "37"}
      height={height ? `${height}` : "36"}
      className={className}
      viewBox="0 0 37 36"
      fill="none"
    >
      <path
        d="M12.1616 18C12.1616 18.3978 12.3197 18.7794 12.601 19.0607C12.8823 19.342 13.2638 19.5 13.6616 19.5C14.0594 19.5 14.441 19.342 14.7223 19.0607C15.0036 18.7794 15.1616 18.3978 15.1616 18C15.1616 17.6022 15.0036 17.2206 14.7223 16.9393C14.441 16.658 14.0594 16.5 13.6616 16.5C13.2638 16.5 12.8823 16.658 12.601 16.9393C12.3197 17.2206 12.1616 17.6022 12.1616 18Z"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.1616 18C21.1616 18.3978 21.3197 18.7794 21.601 19.0607C21.8823 19.342 22.2638 19.5 22.6616 19.5C23.0594 19.5 23.441 19.342 23.7223 19.0607C24.0036 18.7794 24.1616 18.3978 24.1616 18C24.1616 17.6022 24.0036 17.2206 23.7223 16.9393C23.441 16.658 23.0594 16.5 22.6616 16.5C22.2638 16.5 21.8823 16.658 21.601 16.9393C21.3197 17.2206 21.1616 17.6022 21.1616 18Z"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9117 25.5C12.9117 27 10.8777 30 10.1637 30C8.02017 30 6.11667 27.4995 5.16417 25.5C4.21167 22.9995 4.45017 16.7505 7.30617 8.25C9.38817 6.7275 11.4792 6.24 13.6617 6L15.1242 8.8845C17.1358 8.53724 19.192 8.53724 21.2037 8.8845L22.6617 6C24.9117 6.24 27.2262 6.7275 29.4117 8.25C32.4117 16.7505 32.6622 22.9995 31.6617 25.5C30.6612 27.4995 28.6617 30 26.4117 30C25.6617 30 23.4117 27 23.4117 25.5"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6616 24.75C15.9116 26.25 20.4116 26.25 25.6616 24.75"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
