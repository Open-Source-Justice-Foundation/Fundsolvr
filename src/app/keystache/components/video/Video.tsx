import { Suspense } from "react";

export default function Video() {
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          src="https://www.youtube.com/embed/dyUejQOFD2k?si=jzdxmefXJ70HldKa"
          frameBorder="0"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </Suspense>
  );
}
