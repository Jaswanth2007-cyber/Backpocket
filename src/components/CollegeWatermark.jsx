import React from 'react';

/**
 * Authentic collegiate university seal watermark.
 * Designed with academic laurels, double concentric motto rings, heraldic shield,
 * open book of learning, and torch of knowledge.
 * Calibrated to 3.5% opacity for maximum text contrast across all viewports.
 */
export default function CollegeWatermark() {
  return (
    <div className="app-watermark-container" aria-hidden="true">
      <svg
        className="app-watermark"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Laurel Wreath / Ring */}
        <circle cx="200" cy="200" r="185" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="200" cy="200" r="176" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="200" cy="200" r="145" stroke="currentColor" strokeWidth="2" />

        {/* Ring Motto Path (Visualized with arc dashes & stars) */}
        <g stroke="currentColor" strokeWidth="1.5">
          {/* Decorative perimeter stars */}
          <polygon points="200,32 203,40 211,40 205,45 207,53 200,48 193,53 195,45 189,40 197,40" fill="currentColor" />
          <polygon points="200,368 203,360 211,360 205,355 207,347 200,352 193,347 195,355 189,360 197,360" fill="currentColor" />
          <polygon points="32,200 40,203 40,211 45,205 53,207 48,200 53,193 45,195 40,189 40,197" fill="currentColor" />
          <polygon points="368,200 360,203 360,211 355,205 347,207 352,200 347,193 355,195 360,189 360,197" fill="currentColor" />
        </g>

        {/* Inner Heraldic Crest Shield */}
        <path
          d="M200 78 C240 78 280 84 280 115 C280 205 200 285 200 285 C200 285 120 205 120 115 C120 84 160 78 200 78 Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <path
          d="M200 90 C234 90 268 95 268 120 C268 195 200 265 200 265 C200 265 132 195 132 120 C132 95 166 90 200 90 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Open Book of Knowledge in upper half */}
        <path
          d="M155 145 C175 138 195 146 200 150 C205 146 225 138 245 145 V192 C225 185 205 190 200 195 C195 190 175 185 155 192 Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Book spine & pages */}
        <line x1="200" y1="150" x2="200" y2="195" stroke="currentColor" strokeWidth="2" />
        <line x1="165" y1="160" x2="190" y2="157" stroke="currentColor" strokeWidth="1" />
        <line x1="165" y1="172" x2="190" y2="169" stroke="currentColor" strokeWidth="1" />
        <line x1="210" y1="157" x2="235" y2="160" stroke="currentColor" strokeWidth="1" />
        <line x1="210" y1="169" x2="235" y2="172" stroke="currentColor" strokeWidth="1" />

        {/* Torch of Enlightenment in center base */}
        <path
          d="M194 242 L206 242 L203 216 L197 216 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M192 216 C192 216 190 206 200 198 C210 206 208 216 208 216 Z"
          fill="currentColor"
        />

        {/* University Foundation Ribbon Banner at Base */}
        <path
          d="M110 320 Q200 340 290 320 L275 298 Q200 318 125 298 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <line x1="150" y1="316" x2="250" y2="316" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
    </div>
  );
}
