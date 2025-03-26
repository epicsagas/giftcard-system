import { useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, Form, useNavigation, Link } from "@remix-run/react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import dayjs from "dayjs";

export const meta: MetaFunction = () => {
  return [
    { title: "Find Your Gift Cards - Gift Card System" },
    { name: "description", content: "Search for your gift cards by phone number" },
  ];
};

type GiftCard = {
  id: string;
  issuer_name: string;
  recipient_name: string;
  recipient_phone: string;
  balance: number;
  initial_balance: number;
  expiration_date: string;
  is_accepted: boolean;
  is_active: boolean;
  created_at: string;
};

type ActionData = {
  giftCards?: GiftCard[];
  errors?: {
    phone?: string;
    _form?: string;
  };
  searchPerformed?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const phone = formData.get("phone") as string;
  
  if (!phone || phone.trim().length < 10) {
    return json<ActionData>({ 
      errors: { phone: "Valid phone number is required" },
      searchPerformed: true
    }, { status: 400 });
  }
  
  try {
    // API call to search for gift cards
    const response = await fetch(`http://localhost:8080/api/gift-cards/by-recipient/${encodeURIComponent(phone)}`);
    const data = await response.json();
    
    if (!response.ok) {
      return json<ActionData>({ 
        errors: { _form: data.message || "Failed to search for gift cards" },
        searchPerformed: true
      }, { status: response.status });
    }
    
    // Return found gift cards
    return json<ActionData>({ 
      giftCards: data.data,
      searchPerformed: true
    });
  } catch (error) {
    return json<ActionData>({ 
      errors: { _form: "An unexpected error occurred" },
      searchPerformed: true
    }, { status: 500 });
  }
};

export default function SearchGiftCards() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [phone, setPhone] = useState("");
  
  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ""); // Remove non-digits
    setPhone(value);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Find Your Gift Cards</h1>
      
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Search by Phone Number</h2>
        <p className="mb-6 text-gray-600">
          Enter the phone number associated with your gift cards to find all your available cards.
        </p>
        
        {actionData?.errors?._form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {actionData.errors._form}
          </div>
        )}
        
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              className={`form-input ${actionData?.errors?.phone ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
            />
            {actionData?.errors?.phone && (
              <p className="form-error">{actionData.errors.phone}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter the number you used when receiving gift cards
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-8 py-2"
          >
            {isSubmitting ? "Searching..." : "Search Gift Cards"}
          </button>
        </Form>
      </div>
      
      {/* Results Section */}
      {actionData?.searchPerformed && !actionData.errors && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Gift Cards</h2>
          
          {actionData.giftCards && actionData.giftCards.length > 0 ? (
            <div className="space-y-4">
              {actionData.giftCards.map((card) => {
                const balance = (card.balance / 100).toFixed(2);
                const expirationDate = dayjs(card.expiration_date);
                const isExpired = expirationDate.isBefore(dayjs());
                const isActive = card.is_active && card.is_accepted && !isExpired;
                
                return (
                  <div 
                    key={card.id} 
                    className={`card p-4 border-l-4 ${
                      isActive
                        ? 'border-l-green-500'
                        : isExpired
                          ? 'border-l-red-500'
                          : 'border-l-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">
                          Gift Card #{card.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          From: {card.issuer_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Balance: <span className="font-semibold">${balance}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires: {dayjs(card.expiration_date).format('MMM D, YYYY')}
                        </p>
                      </div>
                      
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : isExpired
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isActive
                            ? 'Active'
                            : isExpired
                              ? 'Expired'
                              : card.is_accepted
                                ? 'Inactive'
                                : 'Pending'
                          }
                        </span>
                        
                        <div className="mt-2">
                          <Link 
                            to={`/gift-cards/${card.id}`}
                            className="btn btn-secondary py-1 px-4 text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 text-center rounded-lg">
              <p className="text-gray-600 mb-4">No gift cards found for this phone number.</p>
              <p className="text-sm text-gray-500">
                Make sure you entered the correct phone number or try a different one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}