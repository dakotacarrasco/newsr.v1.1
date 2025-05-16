"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/Button";
import { Search, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock search results
const mockResults = [
  {
    id: 1,
    title: "The Future of Renewable Energy in Urban Environments",
    excerpt: "How cities are adapting to climate change with innovative energy solutions...",
    category: "Technology",
    readTime: "5 min",
    date: "May 15, 2023"
  },
  {
    id: 2,
    title: "Global Markets React to Economic Policy Shifts",
    excerpt: "Investors cautiously optimistic as new fiscal measures are announced...",
    category: "Business",
    readTime: "4 min",
    date: "May 12, 2023"
  },
  {
    id: 3,
    title: "The Rise of Digital Art in Contemporary Culture",
    excerpt: "NFTs and digital exhibitions are changing how we experience art...",
    category: "Culture",
    readTime: "7 min",
    date: "May 10, 2023"
  },
  {
    id: 4,
    title: "Health Experts Recommend New Dietary Guidelines",
    excerpt: "Latest research suggests balanced approach to nutrition is key...",
    category: "Health",
    readTime: "6 min",
    date: "May 8, 2023"
  }
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would fetch results here
    setHasSearched(true);
    console.log("Searching for:", searchQuery);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-8 py-12">
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
            <Input
              type="text"
              placeholder="Search for articles, topics, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border-2 border-black p-3 transition-all duration-300 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <div className="absolute -top-2 -right-2 h-6 w-6 border-2 border-black bg-purple-500"></div>
          </div>
          <div className="flex justify-center mt-4">
            <Button 
              type="submit" 
              className="px-8 py-2 bg-white text-black border-2 border-black font-bold hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">
            Search Results {searchQuery && `for "${searchQuery}"`}
          </h2>
          
          <div className="space-y-6">
            {mockResults.map((result) => (
              <div key={result.id} className="border-2 border-black bg-white p-6 relative hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                {result.id % 2 === 0 && (
                  <div className="absolute -top-2 -right-2 h-6 w-6 border-2 border-black bg-blue-500"></div>
                )}
                {result.id % 3 === 0 && (
                  <div className="absolute -bottom-2 -left-2 h-6 w-6 border-2 border-black bg-red-500"></div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className="px-3 py-1 bg-stone-100 border-2 border-black text-xs font-bold">
                    {result.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{result.readTime}</span>
                  </div>
                </div>
                <Link href={`/articles/${result.id}`} className="block group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {result.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-4">{result.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{result.date}</span>
                  <Link 
                    href={`/articles/${result.id}`}
                    className="flex items-center text-sm font-bold hover:text-blue-600 transition-colors"
                  >
                    Read more <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
