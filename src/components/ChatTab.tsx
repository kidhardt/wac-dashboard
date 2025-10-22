import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getGroundTruthStats } from '../utils';
import {
  NOTEBOOK_LM_CONFIG,
  isNotebookLMDisabled,
  isUserControlled,
  isAutoRoute,
} from '../config/notebookLM';
import { buildSystemPrompt, buildAutoRoutePrompt } from '../utils/notebookPrompts';

/**
 * Message interface for chat history
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  validationWarning?: string; // Added for showing validation corrections
  sources?: Array<'institution-data' | 'notebooks'>; // Track which sources were used
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
  const [includeNotebooks, setIncludeNotebooks] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get ground truth stats for validation
  const groundTruthStats = getGroundTruthStats();

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
      const allMessages = [...messages, userMessage];
      const apiMessages = allMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Build system prompt based on mode
      let systemPrompt: string;
      let maxTokens: number;

      if (isNotebookLMDisabled()) {
        // Mode 1: Disabled - never use NotebookLM
        systemPrompt = buildSystemPrompt(false);
        maxTokens = NOTEBOOK_LM_CONFIG.maxTokensWithoutNotebooks;

      } else if (isUserControlled()) {
        // Mode 2: User-controlled - use checkbox state
        systemPrompt = buildSystemPrompt(includeNotebooks);
        maxTokens = includeNotebooks
          ? NOTEBOOK_LM_CONFIG.maxTokensWithNotebooks
          : NOTEBOOK_LM_CONFIG.maxTokensWithoutNotebooks;

      } else if (isAutoRoute()) {
        // Mode 3: Auto-route - Claude decides
        systemPrompt = buildAutoRoutePrompt();
        maxTokens = NOTEBOOK_LM_CONFIG.maxTokensWithNotebooks;
      } else {
        // Fallback to disabled mode
        systemPrompt = buildSystemPrompt(false);
        maxTokens = NOTEBOOK_LM_CONFIG.maxTokensWithoutNotebooks;
      }

      console.log('Chat mode:', NOTEBOOK_LM_CONFIG.mode);
      console.log('Using NotebookLM:',
        isNotebookLMDisabled() ? 'No (disabled)' :
        isUserControlled() ? (includeNotebooks ? 'Yes (user checked)' : 'No (user unchecked)') :
        'Maybe (auto-route)'
      );

      // Call Claude API through our backend proxy
      const requestBody = {
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: apiMessages,
      };

      console.log('Sending request to proxy server:', {
        messageCount: apiMessages.length,
        systemPromptLength: systemPrompt.length,
        maxTokens: maxTokens,
        mode: NOTEBOOK_LM_CONFIG.mode,
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

      // Detect which sources were used in the response
      const sources: Array<'institution-data' | 'notebooks'> = ['institution-data']; // Always includes data

      if (!isNotebookLMDisabled()) {
        // Check if NotebookLM was consulted based on response content
        const notebookIndicators = [
          'notebooklm',
          'source 2',
          'research from your',
          'according to research',
          'notebook',
        ];

        const lowerContent = assistantContent.toLowerCase();
        const hasNotebookReference = notebookIndicators.some(indicator =>
          lowerContent.includes(indicator)
        );

        if (hasNotebookReference) {
          sources.push('notebooks');
        }
      }

      // Validation logic (runs silently in background for debugging)
      // To re-enable validation warnings, set ENABLE_VALIDATION_WARNINGS = true
      const ENABLE_VALIDATION_WARNINGS = false;
      let validationWarning: string | undefined;

      if (ENABLE_VALIDATION_WARNINGS) {
        // Pattern to detect count claims (e.g., "9 R1 institutions", "8 institutions", etc.)
        const countPattern = /(\d+)\s+(?:R1\s+)?institutions?/gi;
        const matches = [...assistantContent.matchAll(countPattern)];

        if (matches.length > 0) {
          // Check if response contains a numbered list
          const listPattern = /^\d+\.\s+/gm;
          const listItems = assistantContent.match(listPattern);
          const listCount = listItems ? listItems.length : 0;

          // Check claimed vs actual list count
          for (const match of matches) {
            const claimedCount = parseInt(match[1]);
            if (listCount > 0 && claimedCount !== listCount) {
              validationWarning = `⚠️ Validation Warning: Response claimed ${claimedCount} institutions but listed ${listCount}. The actual count is ${listCount}.`;
              console.warn('[VALIDATION]', validationWarning);
              break;
            }
          }

          // Verify against ground truth for R1 institutions
          if (assistantContent.toLowerCase().includes('r1')) {
            for (const match of matches) {
              const claimedCount = parseInt(match[1]);
              if (match[0].toLowerCase().includes('r1') && claimedCount !== groundTruthStats.r1Institutions.total) {
                validationWarning = `⚠️ Validation Warning: Response claimed ${claimedCount} R1 institutions. The correct count is ${groundTruthStats.r1Institutions.total} R1 institutions.`;
                console.warn('[VALIDATION]', validationWarning);
                break;
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        validationWarning,
        sources: NOTEBOOK_LM_CONFIG.enableSourceBadges ? sources : undefined,
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
                <>
                  {message.validationWarning && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">{message.validationWarning}</p>
                    </div>
                  )}
                  <div className="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-li:text-slate-700">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {message.sources.map(source => (
                        <span
                          key={source}
                          className={`px-2 py-1 rounded flex items-center gap-1 ${
                            source === 'institution-data'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {source === 'institution-data' ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Institution Data
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Notebooks
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </>
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
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {((isUserControlled() && includeNotebooks) || isAutoRoute()) && (
                  <span className="text-xs text-blue-600 ml-2">
                    May be consulting notebooks...
                  </span>
                )}
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
        {/* Notebooks Toggle - only shown in user-controlled mode */}
        {isUserControlled() && (
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={includeNotebooks}
                onChange={(e) => setIncludeNotebooks(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Include notebooks from NotebookLM"
              />
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Include Notebooks
              </span>
            </label>

            {includeNotebooks && (
              <p className="text-xs text-blue-600 mt-1 ml-6">
                Response will include insights from your NotebookLM library
              </p>
            )}
          </div>
        )}

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
