"use client";

import { useEffect } from "react";

export default function Refresh() {
  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      sessionStorage.clear();
      console.log("I am being called before unload");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <></>;
}
