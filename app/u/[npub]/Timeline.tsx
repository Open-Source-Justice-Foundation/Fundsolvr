import { CheckIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const timeline = [
  {
    id: 1,
    content: "Applied to:",
    target: "Rewrite the documentation for the Nostr API",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: UserIcon,
    iconBackground: "bg-orange-500",
  },
  {
    id: 2,
    content: "Blog post:",
    target: "Boost your conversion rate",
    href: "#",
    date: "Sep 22",
    datetime: "2020-09-22",
    icon: PencilSquareIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 3,
    content: "Completed bounty:",
    target: "Rewrite TempleOS in Rust",
    href: "#",
    date: "Sep 28",
    datetime: "2020-09-28",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
  {
    id: 4,
    content: "Blog post:",
    target: "Exploring BitVM",
    href: "#",
    date: "Sep 30",
    datetime: "2020-09-30",
    icon: PencilSquareIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 5,
    content: "Completed bounty:",
    target: "Finish Resolvr.io",
    href: "#",
    date: "Oct 4",
    datetime: "2020-10-04",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
];

export default function Timeline() {
  return (
    <div className="flow-root border-t border-gray-600 px-4 pb-8 pt-16 mt-8">
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.iconBackground,
                      "flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-gray-600"
                    )}
                  >
                    <event.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-300">
                      {event.content}{" "}
                      <a href={event.href} className="font-medium text-gray-100">
                        {event.target}
                      </a>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-300">
                    <time dateTime={event.datetime}>{event.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

{
  /* <div className="mx-8 my-8 flex justify-between gap-x-6 rounded-md"> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Bounties claimed: 0</div> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Bounties Created: 0</div> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Sats Earned: 0</div> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Sats Spent: 0</div> */
}
{
  /* </div> */
}

{
  /* <div className="mx-8 my-8 flex justify-between gap-x-8 rounded-md py-4"> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">About</div> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Skill tags</div> */
}
{
  /*   <div className="rounded-md border border-gray-600 p-4">Services</div> */
}
{
  /* </div> */
}
