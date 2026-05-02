import React, { useEffect, useState } from 'react';

const PICK_ANIMATION_MS = 380;

export default function ComparisonCard({ beerA, beerB, onPick, onTooDifficult, disabled }) {
  const [pickedId, setPickedId] = useState(null);

  // Reset picked state whenever the matchup changes
  useEffect(() => {
    setPickedId(null);
  }, [beerA?.surveyBeerId, beerB?.surveyBeerId]);

  if (!beerA || !beerB) return null;

  const handleClick = (winnerId) => {
    if (disabled || pickedId) return;
    setPickedId(winnerId);
    setTimeout(() => onPick(winnerId), PICK_ANIMATION_MS);
  };

  const stateFor = (id) => {
    if (!pickedId) return 'idle';
    return pickedId === id ? 'picked' : 'rejected';
  };

  const interactionDisabled = disabled || !!pickedId;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <p className="text-sm text-[#6E7F99] uppercase tracking-[0.15em] font-semibold">
        Which would you rather drink?
      </p>

      <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <BeerChoice
          beer={beerA}
          state={stateFor(beerA.surveyBeerId)}
          onClick={() => handleClick(beerA.surveyBeerId)}
          disabled={interactionDisabled}
        />

        {/* VS badge (desktop) */}
        <div className="
          hidden md:flex
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-20 pointer-events-none
        ">
          <div className="
            bg-[#8C6F52] text-white font-bold text-xs
            px-3 py-1.5 rounded-full shadow-md
            uppercase tracking-[0.2em]
            border-2 border-[#f2f2f2]
          ">
            vs
          </div>
        </div>

        <BeerChoice
          beer={beerB}
          state={stateFor(beerB.surveyBeerId)}
          onClick={() => handleClick(beerB.surveyBeerId)}
          disabled={interactionDisabled}
        />
      </div>

      <button
        type="button"
        onClick={onTooDifficult}
        disabled={interactionDisabled}
        className="
          mt-1 text-xs text-slate-500 hover:text-[#8C6F52] decoration-slate-300
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        Too difficult... show me a different pair!
      </button>
    </div>
  );
}

function BeerChoice({ beer, state, onClick, disabled }) {
  const tags = (beer.flavorTags || []).slice(0, 4);
  const isPicked = state === 'picked';
  const isRejected = state === 'rejected';
  const isIdle = state === 'idle';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full text-left
        text-white border
        px-4 py-4 flex flex-col gap-2
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#8C6F52] focus:ring-offset-2
        ${isPicked
          ? 'bg-[#8C6F52] border-[#75593f] scale-[1.04] shadow-2xl ring-4 ring-[#8C6F52]/40 z-10'
          : 'bg-[#445A7D] border-[#314466]'}
        ${isRejected ? 'opacity-30 scale-[0.96]' : ''}
        ${isIdle ? 'hover:scale-[1.015] hover:bg-[#3C547A] cursor-pointer' : 'cursor-default'}
        ${disabled && isIdle ? 'cursor-not-allowed' : ''}
      `}
    >
      {/* Picked overlay
      {isPicked && (
        <div className="
          absolute inset-0 z-10 flex items-center justify-center pointer-events-none
        ">
          <span className="
            text-white text-2xl font-extrabold uppercase tracking-[0.3em]
            drop-shadow-md animate-bounce
          ">
            Cheers!
          </span>
        </div>
      )} */}

      {/* Image */}
      {beer.imageUrl && (
        <div className="w-full h-24 flex items-center justify-center bg-white/5 rounded">
          <img
            src={beer.imageUrl}
            alt={beer.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <h3 className="text-base md:text-lg font-bold tracking-[0.04em] uppercase leading-tight">
        {beer.name}
      </h3>

      <div className="text-xs opacity-90">
        <p>{beer.style || 'Style not listed'}</p>
        <p className="text-[10px] mt-0.5 opacity-80 font-semibold">
          {beer.abv != null && `ABV ${(beer.abv * 100).toFixed(1)}%`}
          {beer.abv != null && beer.ibu != null && ' • '}
          {beer.ibu != null && `IBU ${beer.ibu}`}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="
                px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                border border-white/40 bg-white/10 text-white
              "
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
