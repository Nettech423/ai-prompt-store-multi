
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Success() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  useEffect(() => {
    async function f() {
      const s = router.query.session_id;
      if (!s) return;
      const res = await fetch(`/api/session?sessionId=${s}`);
      const data = await res.json();
      setSession(data);
    }
    f();
  }, [router.query.session_id]);
  return (
    <main style={{padding:32}}>
      <h1 style={{color:'#06b6d4'}}>Thank you — purchase complete</h1>
      <p>If you provided an email at checkout, we will email you a one-time download link shortly.</p>
      {session && <pre style={{background:'#111', padding:12}}>{JSON.stringify(session, null, 2)}</pre>}
    </main>
  );
}
