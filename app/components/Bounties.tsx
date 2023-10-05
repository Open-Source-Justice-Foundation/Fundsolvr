const statuses = {
  Open: "text-yellow-400 bg-yellow-400/10",
  Completed: "text-green-400 bg-green-400/10",
  Withdrawn: "text-rose-400 bg-rose-400/10",
};
const activityItems = [
  {
    user: {
      name: "Michael Foster",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Output nevent and nprofile codes with relay hints, add relay hints to tags",
    status: "Open",
    value: "1,000,000",
    date: "45 minutes ago",
    dateTime: "2023-01-23T11:00",
  },
  {
    user: {
      name: "Lindsay Walton",
      imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Zap Polls on Damus",
    status: "Open",
    value: "3,000,000",
    date: "3 hours ago",
    dateTime: "2023-01-23T09:00",
  },
  {
    user: {
      name: "Courtney Henry",
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Follow event hints",
    status: "Withdrawn",
    value: "1,000,000",
    date: "12 hours ago",
    dateTime: "2023-01-23T00:00",
  },
  {
    user: {
      name: "Courtney Henry",
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Open source/Non-propietary video player for Nostros",
    status: "Completed",
    value: "1,600,000",
    date: "2 days ago",
    dateTime: "2023-01-21T13:00",
  },
  {
    user: {
      name: "Michael Foster",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Open source/Non-propietary QR reader for Nostros",
    status: "Open",
    value: "1,600,000",
    date: "5 days ago",
    dateTime: "2023-01-18T12:34",
  },
  {
    user: {
      name: "Courtney Henry",
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Allow user to select to which relays they will publish each note",
    status: "Withdrawn",
    value: "1,000,000",
    date: "1 week ago",
    dateTime: "2023-01-16T15:54",
  },
  {
    user: {
      name: "Michael Foster",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Display \"note seen on relay\" information in the UI",
    status: "Completed",
    value: "1,000,000",
    date: "1 week ago",
    dateTime: "2023-01-16T11:31",
  },
  {
    user: {
      name: "Whitney Francis",
      imageUrl:
        "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Implement seamless relay browsing somehow",
    status: "Completed",
    value: "1,000,000",
    date: "2 weeks ago",
    dateTime: "2023-01-09T08:45",
  },
];

function classNames(...classes: Array<any>) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  return (
    <div className="bg-gray-900 py-10 rounded-lg">
      <table className="mt-6 w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-4/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
        </colgroup>
        <thead className="border-b border-gray-700 text-sm leading-6 text-white">
          <tr>
            <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
              Title
            </th>
            <th scope="col" className="py-2 pl-0 pr-8 font-semibold sm:table-cell">
              Value
            </th>
            <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-8">
              Author/Company
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-8">
              Status
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8">
              Posted Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {activityItems.map((item) => (
            <tr key={item.title}>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex gap-x-3">
                  <div className="text-sm leading-6 text-gray-100">{item.title}</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 text-sm leading-6 text-gray-100 sm:table-cell sm:pr-8">{item.value}</td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex items-center gap-x-4">
                  <img src={item.user.imageUrl} alt="" className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="truncate text-sm font-medium leading-6 text-white">{item.user.name}</div>
                </div>
              </td>
              <td className="py-4 pl-0 pr-4 text-sm leading-6">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                  {/*@ts-ignore*/}
                  <div className={classNames(statuses[item.status], "flex-none rounded-full p-1")}>
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <div className="hidden text-white sm:block">{item.status}</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                <time dateTime={item.dateTime}>{item.date}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
