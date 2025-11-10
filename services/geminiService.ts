import { GoogleGenAI } from "@google/genai";
import { WorkflowState } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getBotResponse = async (state: WorkflowState, history: string, formData?: any): Promise<string> => {
  let prompt = `You are a helpful and professional chatbot assistant for Galvanco, a steel and galvanization company.
  Your tone should be courteous and efficient.
  The user's current step in the conversation is: ${WorkflowState[state]}.
  The conversation history is:
  ${history}
  `;

  switch (state) {
    case WorkflowState.WELCOME:
      prompt += "Greet the user warmly and ask them to select their user type to begin.";
      break;
    case WorkflowState.NEW_CLIENT_MENU:
      prompt += "The user is a new client. Present the main options for new clients: Learn about products, Request a quotation, Schedule a meeting, General inquiries.";
      break;
    case WorkflowState.NEW_CLIENT_QUOTATION:
      prompt += "The user wants a quotation. Start the process by asking for their company name.";
      break;
    case WorkflowState.NEW_CLIENT_QUOTATION_COMPANY:
      prompt += `The user provided their company name: '${formData.company}'. Now ask for the contact person's name.`;
      break;
    case WorkflowState.NEW_CLIENT_QUOTATION_CONTACT:
        prompt += `The user provided the contact person: '${formData.contact}'. Now ask for their email address.`;
        break;
    case WorkflowState.NEW_CLIENT_QUOTATION_EMAIL:
        prompt += `The user provided their email: '${formData.email}'. Now ask for the required product(s).`;
        break;
    case WorkflowState.NEW_CLIENT_QUOTATION_PRODUCT:
        prompt += `The user specified the product(s): '${formData.product}'. Now ask for the required quantity.`;
        break;
    case WorkflowState.NEW_CLIENT_QUOTATION_QUANTITY:
        prompt += `The user provided the quantity: '${formData.quantity}'. Summarize all the details (Company: ${formData.company}, Contact: ${formData.contact}, Email: ${formData.email}, Product: ${formData.product}, Quantity: ${formData.quantity}) and ask for confirmation.`;
        break;
    case WorkflowState.NEW_CLIENT_QUOTATION_CONFIRM:
        prompt += "Acknowledge the confirmation. Inform the user that a new lead has been created in the system and an Account Manager will be in touch shortly.";
        break;
    case WorkflowState.EXISTING_CLIENT_MENU:
        prompt += "The user is an existing client. Present the main options for existing clients: Track my order, Check invoice, Request technical support, Submit complaint.";
        break;
    case WorkflowState.EXISTING_CLIENT_TRACK_ORDER:
        prompt += "The user wants to track an order. Ask for their Order ID.";
        break;
    case WorkflowState.EXISTING_CLIENT_TRACK_ORDER_ID:
        prompt += `The user provided Order ID '${formData.orderId}'. Provide a realistic, simulated real-time status update for this order. Choose one from: Design, Production, Ready, Out for Delivery, Delivered.`;
        break;
    case WorkflowState.VENDOR_MENU:
        prompt += "The user is a vendor/supplier. Present their primary options: Register a Delivery, Book a Delivery Slot, Get Drop-off Instructions, Confirm Arrival, Confirm Unloading & Receiving.";
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY:
        prompt += "The user wants to register a delivery. Start by asking for the Purchase Order (PO) number.";
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_PO:
        prompt += `The user provided PO Number '${formData.poNumber}'. Now, please ask for the supplier name.`;
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_SUPPLIER:
        prompt += `The user provided supplier name '${formData.supplierName}'. Now, please ask for the items being delivered.`;
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_ITEMS:
        prompt += `The user provided the items '${formData.items}'. Now, please ask for the quantities.`;
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_QUANTITY:
        prompt += `The user provided the quantity '${formData.quantity}'. Now, please ask for the vehicle type.`;
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_VEHICLE:
        prompt += `The user provided the vehicle type '${formData.vehicleType}'. Please summarize all the details (PO: ${formData.poNumber}, Supplier: ${formData.supplierName}, Items: ${formData.items}, Quantity: ${formData.quantity}, Vehicle: ${formData.vehicleType}) and ask for final confirmation.`;
        break;
    case WorkflowState.VENDOR_REGISTER_DELIVERY_CONFIRM:
        prompt += "Acknowledge the confirmation. Inform the user that the delivery is now registered, an Advance Shipping Notice (ASN) has been created, and the delivery is planned in the system.";
        break;
    case WorkflowState.INTERNAL_STAFF_MENU:
        prompt += "The user is internal delivery staff. Greet them as a team member and present their options: Confirm Delivery Completed, Report Issue During Delivery, Request Support.";
        break;
    case WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY:
        prompt += "The user wants to confirm a completed delivery. Please ask for the Order ID.";
        break;
    case WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY_ID:
        prompt += `The user provided Order ID '${formData.orderId}'. Acknowledge this and confirm that the order has been marked as 'Delivered' in the ERP, a delivery ticket has been created, and Finance and Sales have been notified.`;
        break;
    case WorkflowState.INTERNAL_STAFF_REPORT_ISSUE:
        prompt += "The user wants to report an issue. Present the common issue types they can select from: Client Unavailable, Wrong Address, Payment Issue, Damaged Goods.";
        break;
    case WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE:
        prompt += `The user reported the issue: '${formData.issueType}'. Acknowledge this and confirm that an incident ticket has been logged and the Operations Manager, Account Manager, and Finance have been notified.`;
        break;
    case WorkflowState.INTERNAL_STAFF_REQUEST_SUPPORT:
        prompt += "The user needs support. Inform them that you can provide a location pin, relevant documents, or connect them to a live agent. Ask them what they need.";
        break;
    case WorkflowState.FEEDBACK:
        prompt += "The interaction is complete. Ask the user if their request was completed successfully (Yes/No) to gather feedback.";
        break;
    case WorkflowState.END:
        prompt += "The user has confirmed their request was successful. Thank them for using the service and close the conversation politely.";
        break;
    default:
      prompt += "The user is in a general state. Provide a helpful, generic response and guide them back to the main menu if necessary.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};
