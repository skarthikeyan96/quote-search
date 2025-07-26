"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Search, Zap, Bookmark, X } from "lucide-react";
import { algoliasearch } from "algoliasearch";
import instantsearch, { InstantSearch } from "instantsearch.js";
import {
  searchBox,
  hits,
  pagination,
  configure,
  refinementList,
} from "instantsearch.js/es/widgets";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";

interface Quote {
  objectID: string;
  quote: string;
  character: string;
  anime: string;
  emotion: string;
  tags: string[];
  sentiment_score: number;
  sentiment_label: string;
}

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

// localStorage key for saved quotes
const SAVED_QUOTES_KEY = "quote-search-saved-quotes";

// localStorage utility functions
const saveQuotesToStorage = (quotes: Quote[]) => {
  try {
    localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(quotes));
  } catch (error) {
    console.error("Error saving quotes to localStorage:", error);
  }
};

const loadQuotesFromStorage = (): Quote[] => {
  try {
    const saved = localStorage.getItem(SAVED_QUOTES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading quotes from localStorage:", error);
    return [];
  }
};

// Simple markdown parser for tags
const parseMarkdownInTag = (tag: string): string => {
  return (
    tag
      // Bold text: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      // Italic text: *text* or _text_
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Inline code: `code`
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>'
      )
      // Links: [text](url)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Strikethrough: ~~text~~
      .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
  );
};

function getEmotionColorClass(emotion: string): string {
  const colorMap: { [key: string]: string } = {
    // Positive emotions
    Inspiring: "bg-blue-100 text-blue-800 border-blue-200",
    Romantic: "bg-pink-100 text-pink-800 border-pink-200",
    Warm: "bg-orange-100 text-orange-800 border-orange-200",
    Joyful: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Hopeful: "bg-green-100 text-green-800 border-green-200",
    Serene: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Energetic: "bg-purple-100 text-purple-800 border-purple-200",
    Humorous: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Noble: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Liberating: "bg-violet-100 text-violet-800 border-violet-200",
    Futuristic: "bg-sky-100 text-sky-800 border-sky-200",
    Spiritual: "bg-amber-100 text-amber-800 border-amber-200",

    // Neutral/Reflective emotions
    Philosophical: "bg-slate-100 text-slate-800 border-slate-200",
    Reflective: "bg-gray-100 text-gray-800 border-gray-200",
    Mysterious: "bg-zinc-100 text-zinc-800 border-zinc-200",
    Nostalgic: "bg-stone-100 text-stone-800 border-stone-200",

    // Negative emotions
    Tragic: "bg-red-100 text-red-800 border-red-200",
    Melancholic: "bg-blue-100 text-blue-800 border-blue-200",
    Terrifying: "bg-red-200 text-red-900 border-red-300",
    Dark: "bg-gray-200 text-gray-900 border-gray-300",
    Furious: "bg-red-300 text-red-900 border-red-400",
    Intense: "bg-orange-200 text-orange-900 border-orange-300",
    Ambitious: "bg-purple-200 text-purple-900 border-purple-300",
    Complex: "bg-gray-200 text-gray-900 border-gray-300",

    // Fallback
    Neutral: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return colorMap[emotion] || colorMap.Neutral;
}

export default function QuoteSearchApp() {
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInstanceRef = useRef<InstantSearch | null>(null);

  // State for saved quotes - start with empty array to avoid hydration mismatch
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSearchReady, setIsSearchReady] = useState(false);

  const { toast } = useToast();

  // Load from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = loadQuotesFromStorage();
    setSavedQuotes(saved);
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever savedQuotes changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveQuotesToStorage(savedQuotes);
    }
  }, [savedQuotes, isHydrated]);

  // Initialize Algolia search
  useEffect(() => {
    if (!searchContainerRef.current) return;

    const search = instantsearch({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
      searchClient,
    });

    search.addWidgets([
      searchBox({
        container: "#algolia-searchbox",
        placeholder: "Search quotes...",
        cssClasses: {
          root: "relative",
          form: "relative",
          input:
            "w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white",
          submit:
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
          reset:
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
        },
      }),

      refinementList({
        container: "#filter-character",
        attribute: "character",
        searchable: false,
        cssClasses: {
          root: "mb-4",
          list: "flex flex-wrap gap-2",
          item: "",
          label: "flex items-center gap-2",
          checkbox: "rounded border-gray-300",
          count: "text-xs text-gray-500",
        },
      }),

      hits({
        container: "#algolia-hits",
        cssClasses: {
          root: "space-y-6",
          list: "space-y-6",
          item: "",
        },
        templates: {
          item: (hit) => {
            // Normalize tags: always array
            const quote = hit.quote;
            const character = hit.character;
            const anime = hit.anime;
            const emotion = hit.emotion;
            const tags = hit.tags || [];
            const sentiment_score = hit.sentiment_score;
            const sentiment_label = hit.sentiment_label;

            // Check if snippet is saved (only after hydration)
            const isSaved =
              isHydrated &&
              savedQuotes.some((saved) => saved.objectID === hit.objectID);

            return `
            

                  <div class="bg-white border border-gray-200 rounded-lg hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group">
                    <div class="p-6">
                      <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                          <blockquote class="text-lg mb-3 leading-relaxed text-gray-900">
                          "${quote}"
                        </blockquote>
                        <div class="text-gray-600 mb-3">
                          <span class="font-medium text-gray-800">${character}</span>
                          <span class="mx-2">•</span>
                          <span class="text-gray-700">${anime}</span>
                          <span class="mx-2">•</span>
                          <span class="text-sm text-gray-500">Anime</span>
                         </div>
                       </div>
                            <button 
                        class="text-gray-400 hover:text-gray-600 p-1 bookmark-btn ${
                          isSaved ? "text-blue-600 hover:text-blue-700" : ""
                        }" 
                        data-object-id="${hit.objectID}"
                        data-saved="${isSaved}"
                        title="${isSaved ? "Remove from saved" : "Save quote"}"
                      >
                        <svg class="w-4 h-4 ${
                          isSaved ? "fill-current" : ""
                        }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmotionColorClass(
                        emotion
                      )} border">
                        ${emotion}
                      </span>
                      ${tags
                        .map(
                          (tag: string) => `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700 hover:border-gray-400">
                          ${tag}
                        </span>
                      `
                        )
                        .join("")}
                    </div>

                    <div class="flex justify-between items-center">
                      <p class="text-sm text-gray-600 italic max-w-md">
                        Sentiment: ${sentiment_score}/10 (${sentiment_label})
                      </p>
                      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button class="text-gray-500 hover:text-gray-700 transition-colors" onclick="copyQuote('${quote}', '${character}', '${anime}')">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                        </button>
                        <button class="text-gray-500 hover:text-blue-600 transition-colors" onclick="shareQuote('${quote}', '${character}', '${anime}')">
                          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            `;
          },
          empty: `
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 class="text-xl font-medium text-gray-900 mb-2">No snippets found</h3>
              <p class="text-gray-500">Try adjusting your search terms or browse all snippets</p>
            </div>
          `,
        },
      }),
      configure({
        hitsPerPage: 4,
      }),
      pagination({
        container: "#algolia-pagination",
        cssClasses: {
          root: "flex justify-center items-center gap-1 sm:gap-2 mt-8",
          list: "flex gap-1 sm:gap-2",
          item: "",
          link: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-10 sm:w-10",
          selectedItem: "",
          disabledItem: "opacity-50 pointer-events-none",
          previousPageItem: "",
          nextPageItem: "",
        },
      }),
    ]);

    search.start();
    searchInstanceRef.current = search;

    // Set search as ready after initialization
    setIsSearchReady(true);

    // Add event listener for bookmark buttons
    const handleBookmarkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const bookmarkBtn = target.closest(".bookmark-btn") as HTMLElement;

      if (bookmarkBtn) {
        const objectId = bookmarkBtn.getAttribute("data-object-id");
        const isSaved = bookmarkBtn.getAttribute("data-saved") === "true";

        if (objectId) {
          // Find the quote in search results
          const quote =
            searchInstanceRef.current?.helper?.lastResults?.hits.find(
              (hit: Quote) => hit.objectID === objectId
            );

          if (quote) {
            if (isSaved) {
              // Remove from saved snippets
              setSavedQuotes((prev) =>
                prev.filter((saved) => saved.objectID !== objectId)
              );
              bookmarkBtn.setAttribute("data-saved", "false");
              bookmarkBtn.classList.remove(
                "text-blue-600",
                "hover:text-blue-700"
              );
              bookmarkBtn.classList.add("text-gray-400", "hover:text-gray-600");
              bookmarkBtn.setAttribute("title", "Save quote");
              const svg = bookmarkBtn.querySelector("svg");
              if (svg) svg.classList.remove("fill-current");

              // Show toast
              toast({
                title: "Quote removed",
                description:
                  "Quote has been removed from your saved collection.",
              });
            } else {
              // Add to saved quotes
              setSavedQuotes((prev) => [...prev, quote]);
              bookmarkBtn.setAttribute("data-saved", "true");
              bookmarkBtn.classList.remove(
                "text-gray-400",
                "hover:text-gray-600"
              );
              bookmarkBtn.classList.add("text-blue-600", "hover:text-blue-700");
              bookmarkBtn.setAttribute("title", "Remove from saved");
              const svg = bookmarkBtn.querySelector("svg");
              if (svg) svg.classList.add("fill-current");

              // Show toast
              toast({
                title: "Quote saved!",
                description: "Quote has been added to your saved collection.",
              });
            }
          }
        }
      }
    };

    // Listen for clicks on bookmark buttons
    document.addEventListener("click", handleBookmarkClick);

    return () => {
      search.dispose();
      document.removeEventListener("click", handleBookmarkClick);
    };
  }, [toast, isHydrated]); // Removed savedSnippets from dependencies

  // Update bookmark states when savedQuotes changes (without recreating search)
  useEffect(() => {
    if (!isHydrated || !searchInstanceRef.current) return;

    // Update all bookmark buttons to reflect current saved state
    const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
    bookmarkButtons.forEach((btn) => {
      const objectId = btn.getAttribute("data-object-id");
      if (objectId) {
        const isSaved = savedQuotes.some(
          (saved) => saved.objectID === objectId
        );
        const bookmarkBtn = btn as HTMLElement;

        // Update data attribute
        bookmarkBtn.setAttribute("data-saved", isSaved.toString());

        // Update classes
        if (isSaved) {
          bookmarkBtn.classList.remove("text-gray-400", "hover:text-gray-600");
          bookmarkBtn.classList.add("text-blue-600", "hover:text-blue-700");
          bookmarkBtn.setAttribute("title", "Remove from saved");
          const svg = bookmarkBtn.querySelector("svg");
          if (svg) svg.classList.add("fill-current");
        } else {
          bookmarkBtn.classList.remove("text-blue-600", "hover:text-blue-700");
          bookmarkBtn.classList.add("text-gray-400", "hover:text-gray-600");
          bookmarkBtn.setAttribute("title", "Save quote");
          const svg = bookmarkBtn.querySelector("svg");
          if (svg) svg.classList.remove("fill-current");
        }
      }
    });
  }, [savedQuotes, isHydrated]);

  const handleRemoveSavedQuote = (quote: Quote) => {
    setSavedQuotes((prev) =>
      prev.filter((saved) => saved.objectID !== quote.objectID)
    );

    toast({
      title: "Quote removed",
      description: "Quote has been removed from your saved collection.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Quote Search
          </h1>
          <p className="text-gray-600">
            Discover and save your favorite fictional quotes
          </p>
          {isHydrated && savedQuotes.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setShowSavedModal(true);
                }}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>
                  {savedQuotes.length} quote
                  {savedQuotes.length !== 1 ? "s" : ""} saved
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Search Interface */}
        <div ref={searchContainerRef} className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <div id="algolia-searchbox"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1">
              <p className="text-sm text-gray-500">Search powered by Algolia</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>Powered by</span>
                <Zap className="w-3 h-3" />
                <span className="font-medium">Algolia</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div id="filter-character"></div>

          {/* Search Results */}
          {!isSearchReady ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quotes...</p>
            </div>
          ) : (
            <>
              <div id="algolia-hits"></div>
              <div id="algolia-pagination"></div>
            </>
          )}
        </div>

        {/* Saved Snippets Modal */}
        {showSavedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                  Saved Quotes ({savedQuotes.length})
                </h2>
                <button
                  onClick={() => {
                    setShowSavedModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {savedQuotes.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No saved quotes
                    </h3>
                    <p className="text-gray-500">
                      Start saving quotes to build your personal collection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {savedQuotes.map((quote) => {
                      // Normalize tags: always array
                      const tags = Array.isArray(quote.tags) ? quote.tags : [];

                      return (
                        <div
                          key={quote.objectID}
                          className="bg-white border border-gray-200 rounded-lg hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group"
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <blockquote className="text-lg mb-3 leading-relaxed text-gray-900">
                                  "{quote.quote}"
                                </blockquote>
                                <div className="text-gray-600 mb-3">
                                  <span className="font-medium text-gray-800">
                                    {quote.character}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span className="text-gray-700">
                                    {quote.anime}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span className="text-sm text-gray-500">
                                    Anime
                                  </span>
                                </div>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                onClick={() => handleRemoveSavedQuote(quote)}
                                title="Remove from saved"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmotionColorClass(
                                  quote.emotion
                                )} border`}
                              >
                                {quote.emotion}
                              </span>
                              {tags.map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700 hover:border-gray-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-600 italic max-w-md">
                                Sentiment: {quote.sentiment_score}/10 (
                                {quote.sentiment_label})
                              </p>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  className="text-gray-500 hover:text-gray-700 transition-colors"
                                  onClick={() => {
                                    const text = `"${quote.quote}" - ${quote.character}, ${quote.anime}`;
                                    navigator.clipboard.writeText(text);
                                    toast({
                                      title: "Quote copied to clipboard!",
                                      duration: 2000,
                                    });
                                  }}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    ></path>
                                  </svg>
                                </button>
                                <button
                                  className="text-gray-500 hover:text-blue-600 transition-colors"
                                  onClick={() => {
                                    const text = `"${quote.quote}" - ${quote.character}, ${quote.anime}`;
                                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                      text
                                    )}`;
                                    window.open(url, "_blank");
                                  }}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toaster */}
        <Toaster />
      </div>
    </div>
  );
}
