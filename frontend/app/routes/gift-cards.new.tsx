import { useActionData, Form, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { z } from "zod";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Gift Card - Gift Card System" },
    { name: "description", content: "Create a new gift card for someone special" },
  ];
};

// Form validation schema
const giftCardSchema = z.object({
  issuerName: z.string().min(2, "Issuer name is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Valid phone number is required"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
  expirationDays: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 365;
    },
    { message: "Expiration must be between 1 and 365 days" }
  ),
});

type FormData = z.infer<typeof giftCardSchema>;
type FormErrors = {
  [K in keyof FormData]?: string;
} & {
  _form?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const rawFormData = Object.fromEntries(formData);
  
  try {
    // Validate form data
    const validatedData = giftCardSchema.parse(rawFormData);
    
    // Convert amount to cents for API
    const amountCents = Math.floor(parseFloat(validatedData.amount) * 100);
    
    // API call to create gift card
    const response = await fetch("http://localhost:8080/api/gift-cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        issuer_name: validatedData.issuerName,
        recipient_name: validatedData.recipientName,
        recipient_phone: validatedData.recipientPhone,
        balance: amountCents,
        expiration_days: parseInt(validatedData.expirationDays),
      }),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return json({ 
        errors: { _form: responseData.message || "Failed to create gift card" } 
      }, { status: 400 });
    }
    
    // Redirect to gift card details page
    return redirect(`/gift-cards/${responseData.data.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormErrors = {};
      
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof FormData;
        errors[path] = err.message;
      });
      
      return json({ errors }, { status: 400 });
    }
    
    return json({ 
      errors: { _form: "An unexpected error occurred" } 
    }, { status: 500 });
  }
};

export default function CreateGiftCard() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [amount, setAmount] = useState("");
  
  // Format currency input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a Gift Card</h1>
      
      <div className="card p-6">
        {actionData?.errors?._form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {actionData.errors._form}
          </div>
        )}
        
        <Form method="post" className="space-y-6">
          {/* Issuer Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="mb-4">
              <label htmlFor="issuerName" className="form-label">Your Name</label>
              <input
                type="text"
                id="issuerName"
                name="issuerName"
                className={`form-input ${actionData?.errors?.issuerName ? 'border-red-500' : ''}`}
                placeholder="Enter your name"
              />
              {actionData?.errors?.issuerName && (
                <p className="form-error">{actionData.errors.issuerName}</p>
              )}
            </div>
          </div>
          
          {/* Recipient Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
            <div className="mb-4">
              <label htmlFor="recipientName" className="form-label">Recipient's Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                className={`form-input ${actionData?.errors?.recipientName ? 'border-red-500' : ''}`}
                placeholder="Enter recipient's name"
              />
              {actionData?.errors?.recipientName && (
                <p className="form-error">{actionData.errors.recipientName}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="recipientPhone" className="form-label">Recipient's Phone Number</label>
              <input
                type="tel"
                id="recipientPhone"
                name="recipientPhone"
                className={`form-input ${actionData?.errors?.recipientPhone ? 'border-red-500' : ''}`}
                placeholder="Enter recipient's phone number"
              />
              {actionData?.errors?.recipientPhone && (
                <p className="form-error">{actionData.errors.recipientPhone}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                The recipient will be notified at this number
              </p>
            </div>
          </div>
          
          {/* Gift Card Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Gift Card Details</h2>
            <div className="mb-4">
              <label htmlFor="amount" className="form-label">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`form-input pl-7 ${actionData?.errors?.amount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {actionData?.errors?.amount && (
                <p className="form-error">{actionData.errors.amount}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="expirationDays" className="form-label">Expiration Period</label>
              <select
                id="expirationDays"
                name="expirationDays"
                className={`form-input ${actionData?.errors?.expirationDays ? 'border-red-500' : ''}`}
                defaultValue="90"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
              {actionData?.errors?.expirationDays && (
                <p className="form-error">{actionData.errors.expirationDays}</p>
              )}
            </div>
          </div>
          
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3"
            >
              {isSubmitting ? "Creating Gift Card..." : "Create Gift Card"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}