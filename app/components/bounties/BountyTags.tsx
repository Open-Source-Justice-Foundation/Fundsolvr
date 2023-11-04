import { useState } from "react";

import { POSSIBLE_TAGS } from "@/app/lib/constants";
import { classNames } from "@/app/lib/utils";
import { useBountyEventStore } from "@/app/stores/eventStore";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function BountyTags() {
  const [query, setQuery] = useState("");
  const { tag, setTag } = useBountyEventStore();

  const filteredPeople =
    query === ""
      ? POSSIBLE_TAGS
      : POSSIBLE_TAGS.filter((person: string) => {
        return person.toLowerCase().includes(query.toLowerCase());
      });

  return (
    <Combobox as="div" value={tag} onChange={setTag}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-lg border-0 bg-white pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person: string) => person}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 sm:text-sm">
            {filteredPeople.map((person) => (
              <Combobox.Option
                key={person}
                value={person}
                className={({ active }) =>
                  classNames(
                    "relative cursor-pointer select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-gray-200"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={classNames("block truncate", selected ? "font-semibold" : "")}>{person}</span>

                    {selected && (
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
  );
}
