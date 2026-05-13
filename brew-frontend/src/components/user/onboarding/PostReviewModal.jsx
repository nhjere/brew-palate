import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import supabase from '../../../supabaseClient.js';
import ComparisonCard from './ComparisonCard.jsx';

const PICK_ANIMATION_MS = 800;

export default function PostReviewModal({ reviewedBeerId, onClose }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const REC_URL = import.meta.env.VITE_RECOMMENDATION_BASE_URL;

  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [matchup, setMatchup] = useState(null);
  const [skippedPairs, setSkippedPairs] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAbortRef = useRef(null);
  const skippedPairsRef = useRef(skippedPairs);
  useEffect(() => { skippedPairsRef.current = skippedPairs; }, [skippedPairs]);

  const pairKey = (m) => [m.beerA.surveyBeerId, m.beerB.surveyBeerId].sort().join(':');

  // --- Auth bootstrap ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setError('You need to be signed in.');
        return;
      }
      setAccessToken(session.access_token);
      setUserId(session.user.id);
      setAuthReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // --- Body scroll lock ---
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fetchMatchup = useCallback(async (skipsArr, signal) => {
    const res = await axios.get(`${REC_URL}/comparisons/post-review/${userId}`, {
      signal,
      params: { reviewed_beer_id: reviewedBeerId, skip: skipsArr },
      paramsSerializer: (p) => {
        const usp = new URLSearchParams();
        if (p.reviewed_beer_id) usp.append('reviewed_beer_id', p.reviewed_beer_id);
        (p.skip || []).forEach((s) => usp.append('skip', s));
        return usp.toString();
      },
    });
    return res.data;
  }, [REC_URL, userId, reviewedBeerId]);

  const applyResp = (resp) => {
    if (!resp || resp.complete) {
      // No opponent available — close silently. Done here (rather than via an
      // effect on `matchup`) so it can't race with the initial render before
      // the first fetch has even started.
      onClose();
    } else {
      setMatchup({ beerA: resp.beerA, beerB: resp.beerB });
    }
  };

  const loadMatchup = useCallback(async (skipsArr) => {
    if (!userId) return;
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError('');
    try {
      const data = await fetchMatchup(skipsArr, controller.signal);
      applyResp(data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch post-review matchup:', err);
      setError('Could not load a comparison. You can close this and try later.');
    } finally {
      setLoading(false);
    }
  }, [fetchMatchup, userId]);

  useEffect(() => {
    if (authReady && userId) loadMatchup(Array.from(skippedPairsRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, userId]);

  const handlePick = async (winnerId) => {
    if (!matchup || submitting) return;
    setSubmitting(true);
    setError('');

    const body = {
      beerAId: matchup.beerA.surveyBeerId,
      beerBId: matchup.beerB.surveyBeerId,
      winnerId,
      context: 'post-review',
    };

    axios.post(`${REC_URL}/comparisons/submit/${userId}`, body).catch((err) => {
      console.warn('Recommender Elo update failed:', err);
    });

    const savePromise = axios.post(`${BACKEND_URL}/api/comparisons`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const animationPromise = new Promise((r) => setTimeout(r, PICK_ANIMATION_MS));

    try {
      await Promise.all([savePromise, animationPromise]);
      onClose();
    } catch (err) {
      console.error('Failed to submit post-review comparison:', err);
      setError('Could not save your pick. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSkipPair = async () => {
    if (!matchup || submitting) return;
    setSubmitting(true);
    setError('');

    const next = new Set(skippedPairs);
    next.add(pairKey(matchup));
    setSkippedPairs(next);

    try {
      await loadMatchup(Array.from(next));
    } finally {
      setSubmitting(false);
    }
  };

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
          aria-label="Close"
        >
          ✕
        </button>

        <header className="flex flex-col gap-2 pr-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#8C6F52]">
            One more quick comparison?
          </h2>
          <p className="text-sm text-slate-600">
            Help us refine your taste — pick the one you'd rather drink.
          </p>
        </header>

        <main className="mt-5 md:mt-6 flex flex-col items-center justify-center min-h-[280px]">
          {error && (
            <div className="w-full mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!authReady || loading || !matchup ? (
            <p className="text-slate-500 italic">Loading…</p>
          ) : (
            <ComparisonCard
              beerA={matchup.beerA}
              beerB={matchup.beerB}
              onPick={handlePick}
              onTooDifficult={handleSkipPair}
              disabled={submitting}
            />
          )}
        </main>
      </div>
    </div>
  );
}
