"use client";

import { useEffect } from "react";

export default function Refresh() {
  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <></>;
}
