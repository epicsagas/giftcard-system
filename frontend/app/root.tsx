import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import globalStyles from "./styles/global.css";
import customStyles from "./styles/custom.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStyles },
  { rel: "stylesheet", href: customStyles },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Gift Card System" },
    { name: "description", content: "A modern gift card issuance and management system" },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="bg-indigo-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gift Card System</h1>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <a href="/" className="hover:underline">Home</a>
                  </li>
                  <li>
                    <a href="/gift-cards/new" className="hover:underline">Create Gift Card</a>
                  </li>
                  <li>
                    <a href="/gift-cards/search" className="hover:underline">Find Your Cards</a>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            <Outlet />
          </main>

          <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4 text-center">
              <p>© {new Date().getFullYear()} Gift Card System. All rights reserved.</p>
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Gift Card System</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {isRouteErrorResponse(error)
              ? `${error.status} - ${error.statusText}`
              : "An error occurred"}
          </h1>
          <p className="mb-8 text-gray-600">
            {isRouteErrorResponse(error)
              ? error.data?.message || "Something went wrong. Please try again."
              : "An unexpected error occurred. Please try again later."}
          </p>
          <a
            href="/"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Go back home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}