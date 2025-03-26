import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { useState } from "react";
import dayjs from "dayjs";

export const meta: MetaFunction = ({ data }) => {
  return [
    { title: data ? `Gift Card #${data.giftCard.id.substring(0, 8)} - Gift Card System` : "Gift Card Not Found" },
    { name: "description", content: "View and manage your gift card" },
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
  qr_code: string | null;
  created_at: string;
};

type LoaderData = {
  giftCard: GiftCard;
  formattedBalance: string;
  formattedInitialBalance: string;
  formattedExpirationDate: string;
  daysUntilExpiration: number;
  isExpired: boolean;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  
  if (!id) {
    throw new Response("Gift card ID is required", { status: 400 });
  }
  
  try {
    // Fetch gift card data from API
    const response = await fetch(`http://localhost:8080/api/gift-cards/${id}`);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Response(responseData.message || "Gift card not found", { 
        status: response.status 
      });
    }
    
    const giftCard = responseData.data;
    
    // Format data for display
    const formattedBalance = (giftCard.balance / 100).toFixed(2);
    const formattedInitialBalance = (giftCard.initial_balance / 100).toFixed(2);
    
    // Format dates
    const expirationDate = dayjs(giftCard.expiration_date);
    const formattedExpirationDate = expirationDate.format("MMMM D, YYYY");
    const now = dayjs();
    const daysUntilExpiration = expirationDate.diff(now, "day");
    const isExpired = daysUntilExpiration < 0;
    
    return json({
      giftCard,
      formattedBalance,
      formattedInitialBalance,
      formattedExpirationDate,
      daysUntilExpiration,
      isExpired
    });
  } catch (error) {
    throw new Response("Failed to load gift card", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();
  const phone = formData.get("phone") as string;
  
  if (!phone) {
    return json({ 
      errors: { phone: "Phone number is required" } 
    }, { status: 400 });
  }
  
  try {
    // Accept gift card API call
    const response = await fetch(`http://localhost:8080/api/gift-cards/${id}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gift_card_id: id,
        recipient_phone: phone,
      }),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return json({ 
        errors: { 
          _form: responseData.message || "Failed to accept gift card" 
        } 
      }, { status: 400 });
    }
    
    // Redirect to same page to show updated status
    return redirect(`/gift-cards/${id}`);
  } catch (error) {
    return json({ 
      errors: { _form: "An unexpected error occurred" } 
    }, { status: 500 });
  }
};

export default function GiftCardDetails() {
  const { 
    giftCard, 
    formattedBalance, 
    formattedInitialBalance,
    formattedExpirationDate,
    daysUntilExpiration,
    isExpired 
  } = useLoaderData<typeof loader>();
  
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gift Card</h1>
      
      {/* Gift Card Display */}
      <div className="gift-card mb-8">
        <div className="gift-card-header">
          <div>
            <div className="gift-card-label">Gift Card</div>
            <div className="text-xl font-semibold">#{giftCard.id.substring(0, 8)}</div>
          </div>
          <div className="text-right">
            <div className="gift-card-label">Status</div>
            <div className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                !giftCard.is_active ? 'bg-red-500' : 
                giftCard.is_accepted ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
              <span>
                {!giftCard.is_active ? 'Inactive' : 
                 giftCard.is_accepted ? 'Active' : 'Pending Acceptance'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="gift-card-body">
          <div className="flex justify-between items-start">
            <div>
              <div className="gift-card-label">Recipient</div>
              <div className="text-lg">{giftCard.recipient_name}</div>
              <div className="text-sm opacity-80">{giftCard.recipient_phone}</div>
            </div>
            <div className="text-right">
              <div className="gift-card-label">From</div>
              <div className="text-lg">{giftCard.issuer_name}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-4">
            <div>
              <div className="gift-card-label">Balance</div>
              <div className="gift-card-amount">${formattedBalance}</div>
              <div className="text-sm opacity-80">
                Original: ${formattedInitialBalance}
              </div>
            </div>
            <div className="text-right">
              <div className="gift-card-label">Expires</div>
              <div>{formattedExpirationDate}</div>
              <div className={`text-sm ${isExpired ? 'text-red-300' : 'opacity-80'}`}>
                {isExpired 
                  ? 'Expired' 
                  : `${daysUntilExpiration} days remaining`}
              </div>
            </div>
          </div>
        </div>
        
        <div className="gift-card-footer">
          <div>
            <div className="gift-card-label">Created</div>
            <div>{dayjs(giftCard.created_at).format("MMM D, YYYY")}</div>
          </div>
          {giftCard.is_accepted && (
            <div className="text-right">
              <div className="gift-card-label">Card ID</div>
              <div>{giftCard.id}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* QR Code Display */}
      {giftCard.is_accepted && giftCard.is_active && !isExpired && (
        <div className="card p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Payment QR Code</h2>
          {giftCard.qr_code ? (
            <div className="flex justify-center">
              <div className="gift-card-qr">
                <img src={giftCard.qr_code} alt="Payment QR Code" />
              </div>
            </div>
          ) : (
            <p className="text-gray-500">QR code generation is pending</p>
          )}
          <p className="mt-4 text-gray-600">
            Scan this QR code at any payment location to use this gift card.
          </p>
        </div>
      )}
      
      {/* Accept Gift Card Form */}
      {!giftCard.is_accepted && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Accept this Gift Card</h2>
          <p className="mb-4 text-gray-600">
            This gift card has been sent to you. Accept it to add it to your account and use it for payments.
          </p>
          
          {!showAcceptForm ? (
            <button
              onClick={() => setShowAcceptForm(true)}
              className="btn btn-primary"
            >
              Accept Gift Card
            </button>
          ) : (
            <>
              {actionData?.errors?._form && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                  {actionData.errors._form}
                </div>
              )}
              
              <Form method="post" className="space-y-4">
                <div>
                  <label htmlFor="phone" className="form-label">
                    Confirm your phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${actionData?.errors?.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {actionData?.errors?.phone && (
                    <p className="form-error">{actionData.errors.phone}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Must match the recipient phone number
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? "Accepting..." : "Accept Gift Card"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAcceptForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </>
          )}
        </div>
      )}
      
      {/* Expired or Inactive Notice */}
      {(isExpired || !giftCard.is_active) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-8">
          <h3 className="font-semibold mb-2">
            {isExpired ? "Gift Card Expired" : "Gift Card Inactive"}
          </h3>
          <p>
            {isExpired 
              ? `This gift card expired on ${formattedExpirationDate} and can no longer be used.` 
              : "This gift card is no longer active and cannot be used for payments."}
          </p>
        </div>
      )}
      
      {/* Gift Card Usage Instructions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">How to Use Your Gift Card</h2>
        <ol className="list-decimal ml-5 space-y-2">
          <li>Accept the gift card by confirming your phone number</li>
          <li>Present the QR code at any payment location</li>
          <li>The merchant will scan your code and enter the payment amount</li>
          <li>Your gift card balance will be updated automatically</li>
        </ol>
      </div>
    </div>
  );
}