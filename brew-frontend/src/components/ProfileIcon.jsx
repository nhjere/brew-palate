import "../index.css"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ProfileIcon() {
    return (
        <input
          type="text"
          placeholder="Search"
          className="w-3/5 p-2 rounded-md bg-orange-100 text-amber-900 placeholder:text-amber-800"
        />
    )
}