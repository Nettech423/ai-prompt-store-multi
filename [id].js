
import { useRouter } from 'next/router';
import products from '../../data/products.json';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const product = products.find(p => p.id === id);
  if (!product) return <div style={{padding:32}}>Loading...</div>;

  const createCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ priceId: product.price_id, metadata:{ productId: product.id } })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('Checkout failed');
  };

  return (
    <main style={{padding:32}}>
      <h1 style={{color:'#7dd3fc'}}>{product.name}</h1>
      <p style={{color:'#9ca3af'}}>{product.description}</p>
      <div style={{marginTop:20}}>
        <strong>{product.price_display}</strong>
        <button onClick={createCheckout} style={{marginLeft:12, padding:'8px 12px', background:'#06b6d4', color:'#000', borderRadius:6}}>Buy</button>
      </div>
    </main>
  );
}
