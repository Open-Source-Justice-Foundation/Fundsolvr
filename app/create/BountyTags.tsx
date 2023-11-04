import { useState } from "react";

import { classNames } from "@/app/lib/utils";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { POSSIBLE_TAGS } from "../lib/constants";

interface PropTypes {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function BountyTags({ tags, setTags }: PropTypes) {
  const [query, setQuery] = useState("");

  const possibleTagsSansAll = POSSIBLE_TAGS.filter((tag) => {
    if (tag === "All") return false;
    if (query === "") return true;
    return tag.toLowerCase().includes(query.toLowerCase());
  });

  const filteredPossibleTags =
    query === ""
      ? possibleTagsSansAll
      : possibleTagsSansAll.filter((tag) => {
        return tag.toLowerCase().includes(query.toLowerCase());
      });

  const handleTagChange = (newTag: string) => {
    if (tags.includes(newTag)) {
      // Remove tag if it's already selected
      const newTags = tags.filter((tag) => tag !== newTag);
      setTags(newTags);
    } else if (tags.length < 5) {
      // Add new tag if less than 5 are selected
      const newTags = [...tags, newTag];
      setTags(newTags);
    } else if (tags.length === 5) {
      alert("You can only select up to 5 tags");
    }
  };

  return (
    <div>
      <Combobox as="div" onChange={handleTagChange}>
        <div className="relative">
          <Combobox.Input
            displayValue={() => ""}
            placeholder="Tags"
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => setQuery("")}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {filteredPossibleTags.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 sm:text-sm">
              {filteredPossibleTags.map((tag) => (
                <Combobox.Option
                  key={tag}
                  value={tag}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-pointer select-none py-2 pl-3 pr-9",
                      active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-gray-200"
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span className={classNames("block truncate", selected ? "font-semibold" : "")}>{tag}</span>

                      {tags.includes(tag) && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            active ? "text-white" : "text-indigo-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
