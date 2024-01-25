"use client";

import { type ChangeEvent, useEffect, useState } from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Input } from "../ui/input";

export default function BountyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const filterValueFromUrl = searchParams.get("filter");
    if (filterValueFromUrl) {
      setFilter(filterValueFromUrl);
    } else {
      setFilter(""); // Reset to default value if 'tag' is not in URL
    }
  }, [searchParams]);

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filter = e.target.value;
    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.set("filter", filter);
    router.push(`${pathname}?${updatedParams.toString()}`);
    setFilter(filter);
  };

  return (
    <Input
      value={filter}
      onChange={handleValueChange}
      className="max-w-[180px] bg-background"
      placeholder="Search..."
    />
  );
}
