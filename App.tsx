import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { OptionButton } from './components/OptionButton';
import { getBotResponse } from './services/geminiService';
import { ChatMessage as ChatMessageType, WorkflowState, Option, FormData } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState>(WorkflowState.WELCOME);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const addMessage = (sender: 'bot' | 'user', content: React.ReactNode) => {
    const newMessage: ChatMessageType = {
      id: Date.now(),
      sender,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleBotTurn = useCallback(async (newState: WorkflowState, data?: FormData) => {
    setIsLoading(true);
    const history = messages.map(m => `${m.sender}: ${typeof m.content === 'string' ? m.content : '[UI Elements]'}`).join('\n');
    const responseText = await getBotResponse(newState, history, data);
    addMessage('bot', responseText);
    setIsLoading(false);
  }, [messages]);
  
  useEffect(() => {
    if (workflowState === WorkflowState.WELCOME && messages.length === 0) {
      handleBotTurn(WorkflowState.WELCOME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowState]);


  const handleOptionClick = (option: Option) => {
    addMessage('user', option.text);
    if (option.payload) {
        const newFormData = { ...formData, ...option.payload };
        setFormData(newFormData);
        setWorkflowState(option.nextState);
        handleBotTurn(option.nextState, newFormData);
    } else {
        setWorkflowState(option.nextState);
        handleBotTurn(option.nextState);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    
    let nextState = workflowState;
    let newFormData = { ...formData };

    switch (workflowState) {
        case WorkflowState.NEW_CLIENT_QUOTATION:
            newFormData.company = userInput;
            nextState = WorkflowState.NEW_CLIENT_QUOTATION_COMPANY;
            break;
        case WorkflowState.NEW_CLIENT_QUOTATION_COMPANY:
            newFormData.contact = userInput;
            nextState = WorkflowState.NEW_CLIENT_QUOTATION_CONTACT;
            break;
        case WorkflowState.NEW_CLIENT_QUOTATION_CONTACT:
            newFormData.email = userInput;
            nextState = WorkflowState.NEW_CLIENT_QUOTATION_EMAIL;
            break;
        case WorkflowState.NEW_CLIENT_QUOTATION_EMAIL:
            newFormData.product = userInput;
            nextState = WorkflowState.NEW_CLIENT_QUOTATION_PRODUCT;
            break;
        case WorkflowState.NEW_CLIENT_QUOTATION_PRODUCT:
            newFormData.quantity = userInput;
            nextState = WorkflowState.NEW_CLIENT_QUOTATION_QUANTITY;
            break;
        case WorkflowState.EXISTING_CLIENT_TRACK_ORDER:
            newFormData.orderId = userInput;
            nextState = WorkflowState.EXISTING_CLIENT_TRACK_ORDER_ID;
            break;
        case WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY:
            newFormData.orderId = userInput;
            nextState = WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY_ID;
            break;
        case WorkflowState.VENDOR_REGISTER_DELIVERY:
            newFormData.poNumber = userInput;
            nextState = WorkflowState.VENDOR_REGISTER_DELIVERY_PO;
            break;
        case WorkflowState.VENDOR_REGISTER_DELIVERY_PO:
            newFormData.supplierName = userInput;
            nextState = WorkflowState.VENDOR_REGISTER_DELIVERY_SUPPLIER;
            break;
        case WorkflowState.VENDOR_REGISTER_DELIVERY_SUPPLIER:
            newFormData.items = userInput;
            nextState = WorkflowState.VENDOR_REGISTER_DELIVERY_ITEMS;
            break;
        case WorkflowState.VENDOR_REGISTER_DELIVERY_ITEMS:
            newFormData.quantity = userInput;
            nextState = WorkflowState.VENDOR_REGISTER_DELIVERY_QUANTITY;
            break;
        case WorkflowState.VENDOR_REGISTER_DELIVERY_QUANTITY:
            newFormData.vehicleType = userInput;
            nextState = WorkflowState.VENDOR_REGISTER_DELIVERY_VEHICLE;
            break;
    }

    setFormData(newFormData);
    setUserInput('');
    setWorkflowState(nextState);
    handleBotTurn(nextState, newFormData);
  };
  
  const renderInputArea = () => {
    if (isLoading) return null;

    let options: Option[] = [];
    let showTextInput = false;
    let textInputPlaceholder = "Type your message...";

    switch (workflowState) {
      case WorkflowState.WELCOME:
        options = [
          { text: "New Client / Prospect", nextState: WorkflowState.NEW_CLIENT_MENU },
          { text: "Existing Client", nextState: WorkflowState.EXISTING_CLIENT_MENU },
          { text: "Vendor / Supplier", nextState: WorkflowState.VENDOR_MENU },
          { text: "Internal Delivery Staff", nextState: WorkflowState.INTERNAL_STAFF_MENU },
        ];
        break;
      case WorkflowState.NEW_CLIENT_MENU:
        options = [
            { text: "Learn about products and services", nextState: WorkflowState.NEW_CLIENT_LEARN },
            { text: "Request a quotation", nextState: WorkflowState.NEW_CLIENT_QUOTATION },
            { text: "Schedule a meeting with Sales", nextState: WorkflowState.NEW_CLIENT_MEETING },
            { text: "General inquiries", nextState: WorkflowState.NEW_CLIENT_GENERAL },
        ];
        break;
      case WorkflowState.EXISTING_CLIENT_MENU:
        options = [
            { text: "Track my order or delivery", nextState: WorkflowState.EXISTING_CLIENT_TRACK_ORDER },
            { text: "Check invoice or payment status", nextState: WorkflowState.EXISTING_CLIENT_CHECK_INVOICE },
            { text: "Request technical support", nextState: WorkflowState.EXISTING_CLIENT_TECH_SUPPORT },
            { text: "Submit complaint or feedback", nextState: WorkflowState.EXISTING_CLIENT_COMPLAINT },
        ];
        break;
      case WorkflowState.VENDOR_MENU:
        options = [
            { text: "Register a Delivery", nextState: WorkflowState.VENDOR_REGISTER_DELIVERY },
            { text: "Book a Delivery Slot", nextState: WorkflowState.VENDOR_BOOK_SLOT },
            { text: "Get Drop-off Instructions", nextState: WorkflowState.VENDOR_GET_INSTRUCTIONS },
            { text: "Confirm Arrival", nextState: WorkflowState.VENDOR_CONFIRM_ARRIVAL },
            { text: "Confirm Unloading & Receiving", nextState: WorkflowState.VENDOR_CONFIRM_UNLOADING },
        ];
        break;
      case WorkflowState.INTERNAL_STAFF_MENU:
        options = [
            { text: "Confirm Delivery Completed", nextState: WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY },
            { text: "Report Issue During Delivery", nextState: WorkflowState.INTERNAL_STAFF_REPORT_ISSUE },
            { text: "Request Support", nextState: WorkflowState.INTERNAL_STAFF_REQUEST_SUPPORT },
        ];
        break;
      case WorkflowState.INTERNAL_STAFF_REPORT_ISSUE:
        options = [
            { text: "Client Unavailable", nextState: WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE, payload: { issueType: 'Client Unavailable' } },
            { text: "Wrong Address", nextState: WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE, payload: { issueType: 'Wrong Address' } },
            { text: "Payment Issue", nextState: WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE, payload: { issueType: 'Payment Issue' } },
            { text: "Damaged Goods", nextState: WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE, payload: { issueType: 'Damaged Goods' } },
        ];
        break;
      case WorkflowState.NEW_CLIENT_QUOTATION:
      case WorkflowState.NEW_CLIENT_QUOTATION_COMPANY:
      case WorkflowState.NEW_CLIENT_QUOTATION_CONTACT:
      case WorkflowState.NEW_CLIENT_QUOTATION_EMAIL:
      case WorkflowState.NEW_CLIENT_QUOTATION_PRODUCT:
      case WorkflowState.EXISTING_CLIENT_TRACK_ORDER:
      case WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY:
      case WorkflowState.VENDOR_REGISTER_DELIVERY:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_PO:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_SUPPLIER:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_ITEMS:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_QUANTITY:
          showTextInput = true;
          if (workflowState === WorkflowState.NEW_CLIENT_QUOTATION) textInputPlaceholder = "Enter your company name...";
          if (workflowState === WorkflowState.NEW_CLIENT_QUOTATION_COMPANY) textInputPlaceholder = "Enter contact person's name...";
          if (workflowState === WorkflowState.NEW_CLIENT_QUOTATION_CONTACT) textInputPlaceholder = "Enter your email...";
          if (workflowState === WorkflowState.NEW_CLIENT_QUOTATION_EMAIL) textInputPlaceholder = "Enter required product(s)...";
          if (workflowState === WorkflowState.NEW_CLIENT_QUOTATION_PRODUCT) textInputPlaceholder = "Enter quantity...";
          if (workflowState === WorkflowState.EXISTING_CLIENT_TRACK_ORDER) textInputPlaceholder = "Enter your Order ID...";
          if (workflowState === WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY) textInputPlaceholder = "Enter the Order ID...";
          if (workflowState === WorkflowState.VENDOR_REGISTER_DELIVERY) textInputPlaceholder = "Enter the PO Number...";
          if (workflowState === WorkflowState.VENDOR_REGISTER_DELIVERY_PO) textInputPlaceholder = "Enter the supplier name...";
          if (workflowState === WorkflowState.VENDOR_REGISTER_DELIVERY_SUPPLIER) textInputPlaceholder = "Enter the items...";
          if (workflowState === WorkflowState.VENDOR_REGISTER_DELIVERY_ITEMS) textInputPlaceholder = "Enter the quantity...";
          if (workflowState === WorkflowState.VENDOR_REGISTER_DELIVERY_QUANTITY) textInputPlaceholder = "Enter the vehicle type...";
          break;
      case WorkflowState.NEW_CLIENT_QUOTATION_QUANTITY:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_VEHICLE:
        options = [
            { text: "Confirm, proceed", nextState: workflowState === WorkflowState.NEW_CLIENT_QUOTATION_QUANTITY ? WorkflowState.NEW_CLIENT_QUOTATION_CONFIRM : WorkflowState.VENDOR_REGISTER_DELIVERY_CONFIRM },
            { text: "Start over", nextState: WorkflowState.WELCOME },
        ];
        break;
      case WorkflowState.FEEDBACK:
        options = [
            { text: "Yes", nextState: WorkflowState.END },
            { text: "No", nextState: WorkflowState.END }, // In a real app, 'No' would escalate
        ];
        break;
      case WorkflowState.NEW_CLIENT_QUOTATION_CONFIRM:
      case WorkflowState.EXISTING_CLIENT_TRACK_ORDER_ID:
      case WorkflowState.INTERNAL_STAFF_CONFIRM_DELIVERY_ID:
      case WorkflowState.INTERNAL_STAFF_REPORT_ISSUE_TYPE:
      case WorkflowState.VENDOR_REGISTER_DELIVERY_CONFIRM:
        options = [
            { text: "Back to main menu", nextState: WorkflowState.WELCOME },
        ];
        break;
    }
    
    if (showTextInput) {
      return (
        <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={textInputPlaceholder}
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        </form>
      );
    }
    
    if (options.length > 0) {
        return (
            <div className="p-4 bg-white border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {options.map(opt => (
                        <OptionButton key={opt.nextState + opt.text} text={opt.text} onClick={() => handleOptionClick(opt)} />
                    ))}
                </div>
            </div>
        );
    }

    return null;
  }
  
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50 shadow-2xl rounded-lg overflow-hidden my-0 md:my-8">
        <header className="bg-gray-800 text-white p-4 flex items-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-800 font-bold text-xl mr-4">
                GV
            </div>
            <div>
                <h1 className="text-xl font-bold">Galvanco Chatbot</h1>
                <p className="text-sm text-green-400 flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>Online</p>
            </div>
        </header>
        <main className="flex-grow p-4 overflow-y-auto bg-gray-100">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && messages.length > 0 && (
                <div className="flex items-start gap-3 my-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">GV</div>
                    <div className="bg-white text-gray-800 p-3 rounded-lg shadow-md rounded-tl-none flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </main>
        {renderInputArea()}
    </div>
  );
};

export default App;
