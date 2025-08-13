
import Link from 'next/link';
import products from '../data/products.json';

export default function Home() {
  return (
    <main style={{padding:32}}>
      <h1 style={{color:'#06b6d4'}}>AI Prompt Store — Multi Product</h1>
      <p>Buy individual prompts. Secure checkout via Stripe.</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginTop:20}}>
        {products.map(p => (
          <div key={p.id} style={{padding:16, border:'1px solid #222', borderRadius:8, background:'#071022'}}>
            <h3 style={{color:'#7dd3fc'}}>{p.name}</h3>
            <p style={{color:'#9ca3af'}}>{p.description}</p>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
              <strong>{p.price_display}</strong>
              <Link href={`/product/${p.id}`}><a style={{background:'#06b6d4', color:'#000', padding:'8px 12px', borderRadius:6}}>View & Buy</a></Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
