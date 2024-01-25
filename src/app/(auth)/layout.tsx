export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full">
      <div className="relative flex w-full flex-col">
        <main className="flex-auto">
          <div className="relative px-2 sm:px-8 lg:px-12">
            <div className="sm:px-8">
              <div className="mx-auto w-full max-w-7xl lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-5xl">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
