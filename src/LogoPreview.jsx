import React from 'react';

export default function LogoPreview() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 gap-6">
      <h2 className="text-white text-xl font-bold tracking-wide">Ask Kin Logo Preview</h2>
      
      {/* Standalone App Icon Container */}
      <div className="w-32 h-32 rounded-[32px] bg-[#0f172a] shadow-2xl flex items-center justify-center border border-gray-800">
        <svg 
          width="76" 
          height="76" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield Base */}
          <path 
            d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" 
            fill="#059669" 
          />
          {/* Inner Shield / Left Leaf Wing */}
          <path 
            d="M12 4.5L17 6.63V11.09C17 14.42 14.95 17.51 12 18.42C9.05 17.51 7 14.42 7 11.09V6.63L12 4.5Z" 
            fill="#10b981" 
          />
          {/* Protective Hand / Cradling element sweeping from bottom right */}
          <path 
            d="M14.5 13.5C13.67 14.75 12.25 15.6 10.67 15.6C9.32 15.6 8.09 15.05 7.2 14.16L8.62 12.74C9.17 13.29 9.93 13.63 10.77 13.63C11.88 13.63 12.85 13.01 13.33 12.09L13.8 11.5C14.07 12.01 14.42 12.75 14.5 13.5Z" 
            fill="#34d399" 
          />
        </svg>
      </div>

      <p className="text-gray-400 text-sm">Verify that this matches your reference design.</p>
    </div>
  );
}