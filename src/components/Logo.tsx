import React, { useState } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'emblem' | 'horizontal';
  className?: string;
  showTagline?: boolean;
  src?: string;
}

export const ACEDEPCrestSVG: React.FC<{ className?: string }> = ({ className = 'h-full w-auto' }) => (
  <svg
    viewBox="0 0 500 560"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Refined Gold Gradient */}
      <linearGradient id="acedepGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9D77E" />
        <stop offset="35%" stopColor="#E5A93C" />
        <stop offset="70%" stopColor="#D4942A" />
        <stop offset="100%" stopColor="#B37418" />
      </linearGradient>

      {/* Subtle Inner Shield Gradient */}
      <linearGradient id="shieldNavyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#0D2342" />
        <stop offset="100%" stopColor="#08182D" />
      </linearGradient>

      {/* Gold Stroke Filter for crispness */}
      <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* ===== 1. OUTER SHIELD BASE (NAVY) ===== */}
    <path
      d="M250 4 
         C250 4, 120 42, 45 58 
         L45 188 
         L455 188 
         L455 58 
         C380 42, 250 4, 250 4 Z"
      fill="url(#shieldNavyGrad)"
    />
    <path
      d="M45 320 
         L45 345 
         C45 440, 150 515, 250 555 
         C350 515, 455 440, 455 345 
         L455 320 
         Z"
      fill="url(#shieldNavyGrad)"
    />

    {/* ===== 2. OUTER GOLD BORDER OF SHIELD ===== */}
    <path
      d="M250 18 
         C230 24, 130 52, 60 68 
         L60 188 
         L440 188 
         L440 68 
         C370 52, 270 24, 250 18 Z"
      stroke="#DE9E22"
      strokeWidth="6"
      fill="none"
    />

    <path
      d="M60 320 
         L60 345 
         C60 428, 155 498, 250 536 
         C345 498, 440 428, 440 345 
         L440 320"
      stroke="#DE9E22"
      strokeWidth="6"
      fill="none"
    />

    {/* ===== 3. TOP SECTION: LAUREL LEAVES & STAR ===== */}
    <g transform="translate(250, 98)">
      <polygon
        points="0,-48 14,-15 48,-15 21,7 31,41 0,20 -31,41 -21,7 -48,-15 -14,-15"
        fill="#DE9E22"
      />
    </g>

    {/* Left Laurel Branch */}
    <g fill="#DE9E22">
      <path d="M195 44 C186 36, 172 38, 166 48 C164 57, 175 64, 185 60 C192 57, 196 49, 195 44 Z" />
      <path d="M172 58 C160 52, 146 56, 142 66 C140 76, 150 83, 160 78 C168 74, 173 66, 172 58 Z" />
      <path d="M152 76 C138 72, 126 80, 124 90 C122 100, 134 105, 143 100 C150 95, 153 85, 152 76 Z" />
      <path d="M136 100 C123 99, 113 109, 114 120 C116 130, 128 133, 136 126 C142 120, 143 109, 136 100 Z" />
      <path d="M128 128 C115 129, 107 140, 110 150 C113 160, 125 161, 132 154 C137 147, 136 136, 128 128 Z" />
      <path d="M130 158 C119 162, 114 175, 121 184 C128 193, 140 189, 144 180 C147 172, 140 162, 130 158 Z" />

      <path d="M200 66 C194 60, 184 64, 180 72 C178 79, 186 85, 193 82 C199 79, 201 72, 200 66 Z" />
      <path d="M182 90 C174 84, 164 90, 162 98 C160 106, 170 110, 176 106 C182 102, 184 96, 182 90 Z" />
      <path d="M168 116 C160 112, 150 118, 150 126 C150 133, 160 137, 166 132 C172 127, 173 121, 168 116 Z" />
      <path d="M160 144 C152 142, 143 150, 145 158 C147 166, 156 168, 162 163 C167 158, 166 148, 160 144 Z" />
    </g>

    {/* Right Laurel Branch */}
    <g fill="#DE9E22">
      <path d="M305 44 C314 36, 328 38, 334 48 C336 57, 325 64, 315 60 C308 57, 304 49, 305 44 Z" />
      <path d="M328 58 C340 52, 354 56, 358 66 C360 76, 350 83, 340 78 C332 74, 327 66, 328 58 Z" />
      <path d="M348 76 C362 72, 374 80, 376 90 C378 100, 366 105, 357 100 C350 95, 347 85, 348 76 Z" />
      <path d="M364 100 C377 99, 387 109, 386 120 C384 130, 372 133, 364 126 C358 120, 357 109, 364 100 Z" />
      <path d="M372 128 C385 129, 393 140, 390 150 C387 160, 375 161, 368 154 C363 147, 364 136, 372 128 Z" />
      <path d="M370 158 C381 162, 386 175, 379 184 C372 193, 360 189, 356 180 C353 172, 360 162, 370 158 Z" />

      <path d="M300 66 C306 60, 316 64, 320 72 C322 79, 314 85, 307 82 C301 79, 299 72, 300 66 Z" />
      <path d="M318 90 C326 84, 336 90, 338 98 C340 106, 330 110, 324 106 C318 102, 316 96, 318 90 Z" />
      <path d="M332 116 C340 112, 350 118, 350 126 C350 133, 340 137, 334 132 C328 127, 327 121, 332 116 Z" />
      <path d="M340 144 C348 142, 357 150, 355 158 C353 166, 344 168, 338 163 C333 158, 334 148, 340 144 Z" />
    </g>

    {/* ===== 4. CENTRAL HORIZONTAL BANNER ===== */}
    <rect x="0" y="188" width="500" height="138" fill="#0B203E" />
    <rect x="0" y="188" width="500" height="12" fill="#DE9E22" />
    <rect x="0" y="314" width="500" height="12" fill="#DE9E22" />

    <text
      x="250"
      y="290"
      textAnchor="middle"
      fill="#DE9E22"
      fontFamily="'Times New Roman', Georgia, serif"
      fontSize="106"
      fontWeight="bold"
      letterSpacing="4"
    >
      ACEDEP
    </text>

    {/* ===== 5. BOTTOM SECTION: 1990 & LOWER LAUREL BRANCHES ===== */}
    <text
      x="250"
      y="374"
      textAnchor="middle"
      fill="#DE9E22"
      fontFamily="'Times New Roman', Georgia, serif"
      fontSize="42"
      fontWeight="bold"
      letterSpacing="2"
    >
      1990
    </text>

    {/* Left branch arching up from cross point */}
    <g fill="#DE9E22">
      <path d="M102 342 C92 348, 86 360, 94 369 C102 376, 114 372, 118 362 C120 354, 113 344, 102 342 Z" />
      <path d="M125 368 C115 376, 111 390, 120 398 C128 406, 140 400, 143 390 C145 381, 137 371, 125 368 Z" />
      <path d="M185 425 C178 436, 180 450, 192 456 C203 461, 212 452, 212 441 C212 432, 200 425, 185 425 Z" />
      <path d="M222 452 C217 464, 224 477, 237 480 C248 483, 256 473, 254 461 C252 453, 238 448, 222 452 Z" />

      <path d="M142 346 C134 352, 131 362, 137 369 C144 374, 153 371, 156 363 C158 356, 151 348, 142 346 Z" />
      <path d="M168 372 C160 380, 160 390, 168 397 C176 402, 184 397, 187 389 C189 382, 180 374, 168 372 Z" />
      <path d="M198 400 C191 409, 194 420, 203 425 C212 429, 219 423, 220 415 C221 408, 210 402, 198 400 Z" />
    </g>

    {/* Right branch arching up from cross point */}
    <g fill="#DE9E22">
      <path d="M398 342 C408 348, 414 360, 406 369 C398 376, 386 372, 382 362 C380 354, 387 344, 398 342 Z" />
      <path d="M375 368 C385 376, 389 390, 380 398 C372 406, 360 400, 357 390 C355 381, 363 371, 375 368 Z" />
      <path d="M315 425 C322 436, 320 450, 308 456 C297 461, 288 452, 288 441 C288 432, 300 425, 315 425 Z" />
      <path d="M278 452 C283 464, 276 477, 263 480 C252 483, 244 473, 246 461 C248 453, 262 448, 278 452 Z" />

      <path d="M358 346 C366 352, 369 362, 363 369 C356 374, 347 371, 344 363 C342 356, 349 348, 358 346 Z" />
      <path d="M332 372 C340 380, 340 390, 332 397 C324 402, 316 397, 313 389 C311 382, 320 374, 332 372 Z" />
      <path d="M302 400 C309 409, 306 420, 297 425 C288 429, 281 423, 280 415 C279 408, 290 402, 302 400 Z" />
    </g>

    {/* Ribbon tie at branch intersection */}
    <path
      d="M234 496 C242 490, 258 490, 266 496 C262 506, 238 506, 234 496 Z"
      fill="#DE9E22"
    />
    <path
      d="M242 500 C238 512, 226 525, 218 532 C226 525, 238 518, 246 505 Z"
      fill="#DE9E22"
    />
    <path
      d="M258 500 C262 512, 274 525, 282 532 C274 525, 262 518, 254 505 Z"
      fill="#DE9E22"
    />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  className = 'h-12',
  showTagline = false,
  src,
}) => {
  // Lista ordenada de caminhos para tentar carregar o logo (IMG_3289.png, logo.png ou src customizado)
  const candidateSources = src ? [src] : ['/IMG_3289.png', '/logo.png', '/IMG_4378.jpeg'];
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [hasFailedAllCandidates, setHasFailedAllCandidates] = useState(false);

  const isLightBg = variant === 'dark';

  const handleImageError = () => {
    if (currentCandidateIndex < candidateSources.length - 1) {
      setCurrentCandidateIndex((prev) => prev + 1);
    } else {
      setHasFailedAllCandidates(true);
    }
  };

  const currentSrc = candidateSources[currentCandidateIndex];

  // Renderiza a imagem PNG se disponível, ou o SVG vetorial como fallback
  const renderCrest = () => {
    if (!hasFailedAllCandidates && currentSrc) {
      return (
        <img
          key={currentSrc}
          src={currentSrc}
          alt="Logotipo Oficial ACEDEP"
          onError={handleImageError}
          className="h-full w-auto object-contain drop-shadow-md select-none"
          loading="eager"
        />
      );
    }
    return <ACEDEPCrestSVG className="h-full w-auto" />;
  };

  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderCrest()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Shield Crest or Image */}
      <div className="relative h-full aspect-[500/560] flex items-center justify-center shrink-0">
        {renderCrest()}
      </div>

      {/* Optional Tagline / Complementary Text if requested */}
      {showTagline && (
        <div className="flex flex-col justify-center text-left leading-tight">
          <span className={`text-xs font-semibold tracking-wider uppercase ${isLightBg ? 'text-slate-600' : 'text-[#f3e5ab]'}`}>
            Associação Cultural e Esportiva
          </span>
          <span className={`text-[10px] tracking-normal font-medium ${isLightBg ? 'text-slate-500' : 'text-slate-300'}`}>
            de Deficientes Paulistas • Desde 1990
          </span>
        </div>
      )}
    </div>
  );
};

