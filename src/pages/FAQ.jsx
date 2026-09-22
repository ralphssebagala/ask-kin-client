import { useState } from "react";
import { faqs } from "../data/faq.js";

const categories = [...new Set(faqs.map(f => f.category))];

export default function FAQ() {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = faqs.filter(f => f.category === activeCat);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Quick answers without the clutter.</p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCat(cat); setOpenIndex(null); }}
            className={`px-4 py-2 rounded-full text-sm border transition
              ${activeCat === cat? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-black"}`}
          >
            {cat.replace(" & ", " & ")}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="divide-y border rounded-2xl overflow-hidden">
        {filtered.map((item, i) => (
          <div key={i} className="bg-white">
            <button
              onClick={() => setOpenIndex(openIndex === i? null : i)}
              className="w-full flex justify-between items-center text-left p-5"
            >
              <span className="font-medium pr-4">{item.q}</span>
              <span className="text-xl leading-none">{openIndex === i? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed text-[15px]">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Still need help? Contact support from your Dashboard.
      </p>
    </div>
  );
}