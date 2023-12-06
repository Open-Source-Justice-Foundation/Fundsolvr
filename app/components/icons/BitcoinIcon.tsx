import { classNames } from "../../lib/utils";

interface Props {
  width?: string;
  height?: string;
  className?: string;
}

export default function BitcoinIcon(props: Props) {
  const { width, height, className } = props;
  const classes = classNames("fill-bitcoin stroke-bitcoin", className ? className : "");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : "25"}
      height={height ? height : "24"}
      viewBox="0 0 25 24"
      className={classes}
    >
      <path
        d="M13.3808 18.5V18.25H13.1308H11.0308H10.7808V18.5V21V21.25H11.0308H13.1308H13.3808V21V18.5ZM19.0808 17H19.3308V16.75V15.25V15H19.0808H5.08081H4.83081V15.25V16.75V17H5.08081H19.0808ZM19.0808 13H19.3308V12.75V11.25V11H19.0808H5.08081H4.83081V11.25V12.75V13H5.08081H19.0808ZM19.0808 9H19.3308V8.75V7.25V7H19.0808H5.08081H4.83081V7.25V8.75V9H5.08081H19.0808ZM13.3808 3V2.75H13.1308H11.0308H10.7808V3V5.5V5.75H11.0308H13.1308H13.3808V5.5V3Z"
        stroke-width="0.5"
        fill="inherit"
        stroke="inherit"
      />
    </svg>
  );
}
