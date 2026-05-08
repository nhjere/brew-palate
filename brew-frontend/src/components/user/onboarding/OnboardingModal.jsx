import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import supabase from '../../../supabaseClient.js';
import ComparisonCard from './ComparisonCard.jsx';

const TARGET_ROUNDS = 8;
const PICK_ANIMATION_MS = 800;

export default function OnboardingModal({ onClose }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const REC_URL = import.meta.env.VITE_RECOMMENDATION_BASE_URL;

  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // roundIndex is seeded from comparison history so re-opening the survey
  // continues from prior progress instead of resetting to 0.
  const [roundIndex, setRoundIndex] = useState(0);
  const [matchup, setMatchup] = useState(null);
  const [skippedPairs, setSkippedPairs] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  const fetchAbortRef = useRef(null);

  // Pre-fetched next matchup so it's ready the moment the user picks.
  // We always prefetch with the current matchup pair added to the skip list,
  // so the prefetched response is guaranteed to be a different pair.
  const [nextMatchup, setNextMatchup] = useState(null);
  const prefetchPromiseRef = useRef(null);

  
  // Latest skippedPairs accessible to closures without re-creating callbacks
  const skippedPairsRef = useRef(skippedPairs);
  useEffect(() => { skippedPairsRef.current = skippedPairs; }, [skippedPairs]);

  const pairKey = (m) => [m.beerA.surveyBeerId, m.beerB.surveyBeerId].sort().join(':');

  const applyMatchupResp = (resp) => {
    if (!resp) return;
    if (resp.complete) {
      setMatchup(null);
      setComplete(true);
    } else {
      setMatchup({ beerA: resp.beerA, beerB: resp.beerB });
    }
  };

  // --- Auth bootstrap + seed roundIndex from prior survey comparisons ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setError('You need to be signed in to take the survey.');
        return;
      }

      const token = session.access_token;
      setAccessToken(token);
      setUserId(session.user.id);

      // Seed progress from prior comparison history so re-opening picks up
      // where the user left off. Failure is non-fatal: fall back to 0.
      try {
        const res = await axios.get(`${BACKEND_URL}/api/comparisons/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && Array.isArray(res.data)) {
          const surveyCount = res.data.filter((c) => c.context === 'survey').length;
          const seeded = Math.min(surveyCount, TARGET_ROUNDS);
          setRoundIndex(seeded);
          if (seeded >= TARGET_ROUNDS) setComplete(true);
        }
      } catch (err) {
        console.warn('Could not seed onboarding progress from history:', err);
      }

      if (!cancelled) setAuthReady(true);
    })();
    return () => { cancelled = true; };
  }, [BACKEND_URL]);

  // --- Body scroll lock while modal is open ---
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Low-level fetch — returns the raw response or throws.
  const fetchMatchupData = useCallback(async (skipsArr, signal) => {
    const res = await axios.get(`${REC_URL}/comparisons/next/${userId}`, {
      signal,
      params: { skip: skipsArr },
      paramsSerializer: (p) => {
        const usp = new URLSearchParams();
        (p.skip || []).forEach((s) => usp.append('skip', s));
        return usp.toString();
      },
    });
    return res.data;
  }, [REC_URL, userId]);

  // Initial load — only used for the first matchup (no prefetch yet)
  const loadInitial = useCallback(async () => {
    if (!userId) return;
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError('');
    try {
      const data = await fetchMatchupData(
        Array.from(skippedPairsRef.current),
        controller.signal,
      );
      applyMatchupResp(data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch initial matchup:', err);
      setError('Could not load the next pair. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchMatchupData, userId]);

  useEffect(() => {
    if (authReady && userId && !complete) loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, userId]);

  // Prefetch the next matchup as soon as the current one is rendered. The
  // prefetched response always excludes the current pair so it's safe to
  // promote on either a pick or a "Too difficult" skip.
  useEffect(() => {
    if (!matchup || complete) return;
    const skipsForPrefetch = [...skippedPairsRef.current, pairKey(matchup)];
    const promise = fetchMatchupData(skipsForPrefetch);
    prefetchPromiseRef.current = promise;
    promise
      .then((data) => {
        if (prefetchPromiseRef.current === promise) {
          setNextMatchup(data);
        }
      })
      .catch(() => {
        // Non-fatal: advanceToNext will fall back to a direct fetch
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchup]);

  // Promote the prefetched response, await an in-flight prefetch, or
  // fall back to a fresh fetch as a last resort.
  const advanceToNext = useCallback(async (skipsArr) => {
    if (nextMatchup) {
      const resp = nextMatchup;
      setNextMatchup(null);
      prefetchPromiseRef.current = null;
      applyMatchupResp(resp);
      return;
    }
    if (prefetchPromiseRef.current) {
      try {
        const resp = await prefetchPromiseRef.current;
        prefetchPromiseRef.current = null;
        if (resp) {
          setNextMatchup(null);
          applyMatchupResp(resp);
          return;
        }
      } catch {
        // fall through
      }
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchMatchupData(skipsArr);
      applyMatchupResp(data);
    } catch (err) {
      console.error('Failed to fetch next matchup:', err);
      setError('Could not load the next pair. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchMatchupData, nextMatchup]);

  // --- Pick a winner ---
  const handlePick = async (winnerId) => {
    if (!matchup || submitting) return;
    setSubmitting(true);
    setError('');

    const body = {
      beerAId: matchup.beerA.surveyBeerId,
      beerBId: matchup.beerB.surveyBeerId,
      winnerId,
      context: 'survey',
    };

    // Fire-and-forget the recommender's Elo update. It doesn't block the
    // critical path because Elo can be replayed from the comparison record
    // if this call ever fails.
    axios.post(`${REC_URL}/comparisons/submit/${userId}`, body).catch((err) => {
      console.warn('Recommender Elo update failed:', err);
    });

    // Run the backend save and the pick animation in parallel so perceived
    // latency is max(save, animation) instead of save + animation.
    const savePromise = axios.post(`${BACKEND_URL}/api/comparisons`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const animationPromise = new Promise((r) => setTimeout(r, PICK_ANIMATION_MS));

    try {
      await Promise.all([savePromise, animationPromise]);

      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);

      if (nextRound >= TARGET_ROUNDS) {
        setMatchup(null);
        setComplete(true);
        setNextMatchup(null);
      } else {
        await advanceToNext(Array.from(skippedPairs));
      }
    } catch (err) {
      console.error('Failed to submit comparison:', err);
      setError('Could not save your pick. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Too difficult: skip this pair ---
  const handleTooDifficult = async () => {
    if (!matchup || submitting) return;
    setSubmitting(true);
    setError('');

    const key = pairKey(matchup);
    const next = new Set(skippedPairs);
    next.add(key);
    setSkippedPairs(next);

    try {
      await advanceToNext(Array.from(next));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const progress = Math.min(roundIndex, TARGET_ROUNDS);
  const progressPct = Math.round((progress / TARGET_ROUNDS) * 100);
  const displayRound = complete
    ? TARGET_ROUNDS
    : Math.min(progress + 1, TARGET_ROUNDS);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col md:items-center md:justify-center">
      <div
        className="
          bg-[#f2f2f2] text-slate-900 relative w-full h-full p-4 overflow-y-auto rounded-none
          md:w-[680px] md:h-auto md:max-h-[88vh] md:rounded-2xl md:p-6 md:shadow-lg md:border md:border-slate-200
        "
      >
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
          onClick={onClose}
          aria-label="Close survey"
        >
          ✕
        </button>

        {/* Header */}
        <header className="flex flex-col gap-2 pr-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#8C6F52]">
            Tell us what you like
          </h2>
          <p className="text-sm text-slate-600">
            Pick the beer you'd rather drink with {TARGET_ROUNDS} quick rounds!
          </p>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Round {displayRound} of {TARGET_ROUNDS}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3C547A] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="mt-5 md:mt-6 flex flex-col items-center justify-center min-h-[280px]">
          {error && (
            <div className="w-full mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!authReady ? (
            <p className="text-slate-500 italic">Loading…</p>
          ) : complete ? (
            <CompletionPanel onContinue={handleFinish} />
          ) : loading || !matchup ? (
            <p className="text-slate-500 italic">Loading next pair…</p>
          ) : (
            <ComparisonCard
              beerA={matchup.beerA}
              beerB={matchup.beerB}
              onPick={handlePick}
              onTooDifficult={handleTooDifficult}
              disabled={submitting}
            />
          )}
        </main>

        {/* Footer */}
        {!complete && (
          <footer className="mt-6 flex justify-center md:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-full
                bg-white border border-slate-200
                text-sm font-medium text-slate-600
                hover:border-[#8C6F52] hover:text-[#8C6F52] hover:bg-[#faf6f0]
                transition-colors
              "
            >
              Skip Survey for Now!
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function CompletionPanel({ onContinue }) {
  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-4 text-center py-6">
      <h3 className="text-2xl md:text-3xl font-bold text-[#8C6F52]">
        Your taste profile is ready.
      </h3>
      <p className="text-slate-600">
        Your picks shaped your starter recommendations. You can refine them
        anytime from the dashboard.
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="
          mt-2 px-8 py-3 rounded-full bg-[#3C547A] text-white font-semibold
          uppercase tracking-wide hover:bg-[#314466] transition-colors
        "
      >
        See your recommendations
      </button>
    </div>
  );
}
