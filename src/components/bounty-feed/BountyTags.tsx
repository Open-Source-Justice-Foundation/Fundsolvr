"use client";

import React, { useEffect, useState } from "react";

import { TAGS } from "~/lib/constants";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function BountyTags() {
  const router = useRouter();
  const params = useParams();
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    const tagFromURL = params.tag;
    if (tagFromURL && typeof tagFromURL === "string") {
      setSelectedTag(tagFromURL);
    } else {
      setSelectedTag("");
    }
  }, [params.tag]);

  const handleValueChange = (newTag: string) => {
    if (newTag === "all") {
      router.push("/");
    } else router.push(`/tag/${newTag}`);
    setSelectedTag(newTag);
  };

  return (
    <Select onValueChange={handleValueChange} value={selectedTag}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select tag" />
      </SelectTrigger>
      <SelectContent>
        {["all", ...TAGS].map((tag: string) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
