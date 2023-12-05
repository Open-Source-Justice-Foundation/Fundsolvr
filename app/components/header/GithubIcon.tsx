interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export default function GithubIcon(props: Props) {
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
        d="M13.6616 28.5002C7.21162 30.6002 7.21162 24.7502 4.66162 24.0002M22.6616 31.5002V26.2502C22.6616 24.7502 22.8116 24.1502 21.9116 23.2502C26.1116 22.8002 30.1616 21.1502 30.1616 14.2502C30.1598 12.4576 29.4604 10.7361 28.2116 9.45017C28.7973 7.89312 28.7434 6.16761 28.0616 4.65017C28.0616 4.65017 26.4116 4.20017 22.8116 6.60017C19.7625 5.80605 16.5608 5.80605 13.5116 6.60017C9.91162 4.20017 8.26162 4.65017 8.26162 4.65017C7.57984 6.16761 7.52592 7.89312 8.11162 9.45017C6.8628 10.7361 6.16345 12.4576 6.16162 14.2502C6.16162 21.1502 10.2116 22.8002 14.4116 23.2502C13.5116 24.1502 13.5116 25.0502 13.6616 26.2502V31.5002"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
