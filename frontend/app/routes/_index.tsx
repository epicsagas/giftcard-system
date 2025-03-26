import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Gift Card System - Send and Receive Digital Gift Cards" },
    { name: "description", content: "Create, send, and use digital gift cards with our secure platform." },
  ];
};

export default function Index() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Digital Gift Cards <span className="text-indigo-600">Made Simple</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
          Create and send personalized gift cards that can be used anywhere with our QR code technology.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/gift-cards/new"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Create a Gift Card
          </Link>
          <Link
            to="/gift-cards/search"
            className="btn btn-secondary text-lg px-8 py-3"
          >
            Find Your Cards
          </Link>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
            <img
              src="/images/gift-card-hero.svg"
              alt="Gift Card Illustration"
              className="w-full max-h-80 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create a Gift Card</h3>
              <p className="text-gray-600">
                Specify the recipient's name, phone number, amount, and expiration date.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Recipient Accepts</h3>
              <p className="text-gray-600">
                The recipient receives a notification and accepts the gift card to activate it.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Use Anywhere</h3>
              <p className="text-gray-600">
                The gift card can be used at any payment location by scanning the QR code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Gift Cards</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Our platform uses advanced encryption to keep all gift card data secure.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
                <p className="text-gray-600">
                  Gift cards are delivered instantly to recipients via phone number.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Universal Acceptance</h3>
                <p className="text-gray-600">
                  Use your gift card balance at any participating merchant with QR scanning capability.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
                <p className="text-gray-600">
                  Add personal messages and customize your gift cards for any occasion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Send a Gift Card?</h2>
          <p className="text-xl mb-8 opacity-90">
            Create your first gift card in less than a minute. No account required!
          </p>
          <Link
            to="/gift-cards/new"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}