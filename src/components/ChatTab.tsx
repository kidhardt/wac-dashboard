import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { institutions } from '../data/institutions';
import programDescriptions from '../data/program-descriptions.json';

/**
 * Message interface for chat history
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * ChatTab component - Interactive chat interface for WAC Dashboard
 * Provides a conversational interface for querying institution data
 */
const ChatTab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create system prompt with institution data
  const systemPrompt = `You are a helpful WAC Dashboard assistant. You help users explore and analyze Writing Across the Curriculum (WAC) programs at different institutions.

You have access to data for 12 institutions:
${institutions.map(inst => `
- ${inst.name} (${inst.shortName})
  * Location: ${inst.city}, ${inst.state}
  * Type: ${inst.institutionType}
  * Carnegie Classification: ${inst.carnegieClassification}
  * Total Enrollment: ${inst.totalEnrollment.toLocaleString()}
  * WAC Program Established: ${inst.wacProgramEstablished}
  * WAC Budget: $${inst.wacBudget?.toLocaleString() || 'N/A'}
  * Writing Intensive Courses: ${inst.writingIntensiveCourses}
  * Required WI Courses: ${inst.requiredWICourses}
  * Writing Center Staff: ${inst.writingCenterStaff}
  * Writing Tutors Available: ${inst.writingTutorsAvailable}
  * Faculty Workshops Per Year: ${inst.facultyWorkshopsPerYear}
`).join('\n')}

DETAILED PROGRAM DESCRIPTIONS:
${programDescriptions.institutions.map(desc => `
${desc.id.toUpperCase()}:
${desc.programDescription}
`).join('\n')}

Answer questions accurately based on this data. If asked about an institution not in the dataset, politely explain that you only have data for these 12 institutions. Be specific and cite numbers when available.`;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageContent = inputValue;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare messages for API (convert to Claude API format)
      // Filter to ensure messages alternate user/assistant and don't start with assistant
      const allMessages = [...messages, userMessage];
      const apiMessages = allMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call Claude API through our backend proxy
      const requestBody = {
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: apiMessages,
      };

      console.log('Sending request to proxy server:', {
        messageCount: apiMessages.length,
        systemPromptLength: systemPrompt.length,
        firstMessage: apiMessages[0],
      });

      const response = await fetch('http://localhost:3004/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Extract assistant response
      const assistantContent = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Claude API:', error);

      // Add error message to chat with details
      const errorDetails = error instanceof Error ? error.message : String(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error while processing your request:\n\n${errorDetails}\n\nPlease check the browser console for more details.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setIsClearing(true);
    // Wait for fade animation to complete before clearing
    setTimeout(() => {
      setMessages([]);
      setIsClearing(false);
    }, 300); // Match the transition duration
  };

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Chat Interface">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-900">Chat</h2>
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-4 space-y-4">
        {/* Welcome message - only shown when no messages */}
        {messages.length === 0 && !isClearing && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white border border-slate-200 text-slate-900">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold">Assistant:</span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                Hello! I'm your WAC Research Assistant. Ask me a question!
              </p>
            </div>
          </div>
        )}

        <div className={`space-y-4 transition-opacity duration-300 ${isClearing ? 'opacity-0' : 'opacity-100'}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold">
                  {message.role === 'user' ? 'You' : 'Assistant'}:
                </span>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {message.role === 'assistant' ? (
                <div className="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-li:text-slate-700">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 max-w-[80%]">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-900">Assistant:</span>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Clear Chat Button - aligned left with message padding */}
        {messages.length > 0 && (
          <div className="pt-4 pb-2">
            <button
              onClick={handleClearChat}
              disabled={isClearing || isTyping}
              className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask here..."
            className="flex-1 px-4 py-2 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            aria-label="Chat message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, or click the Send button
        </p>
      </div>
    </div>
  );
};

export default ChatTab;
