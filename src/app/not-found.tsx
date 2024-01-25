import Footer from "~/components/footer/Footer";
import Header from "~/components/header/Header";

export default function NotFound() {
  return (
    <div className="flex w-full">
      <div className="relative flex w-full flex-col">
        <main className="flex-auto">
          <div className="relative px-4">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mx-auto max-w-4xl">
                <Header />
                <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-48 lg:px-8">
                  <p className="text-base font-semibold leading-8 text-primary">
                    404
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
                    Page not found
                  </h1>
                  <p className="mt-6 text-base leading-7 text-secondary-foreground">
                    Sorry, we couldn’t find the page you’re looking for.
                  </p>
                  <div className="mt-10">
                    <a
                      href="/"
                      className="text-sm font-semibold leading-7 text-primary"
                    >
                      <span aria-hidden="true">&larr;</span> Back to home
                    </a>
                  </div>
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
