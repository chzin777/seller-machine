import { NextResponse } from 'next/server';
import { recomputeStats, recomputeAssociations, generateRecommendations, runRecompraAlerts } from '../../../../lib/rules';
import { createServerClient } from '../../../../lib/supabase/server';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const categories = ['Descartáveis', 'Limpeza', 'Copa'];
const basket = ['Garfo', 'Prato', 'Faca', 'Copo'];

export async function POST() {
  const supabase = createServerClient();
  // Verifica se já tem dados
  const { data: customers } = await supabase.from('customers').select('id').limit(1);
  if (customers && customers.length) return NextResponse.json({ seeded: false });
  // Clientes
  const custs = Array.from({ length: 80 }).map((_, i) => ({
    customer_code: `C${i+1}`.padStart(4, '0'),
    name: `Cliente ${i+1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  await supabase.from('customers').insert(custs);
  // Produtos
  const prods = Array.from({ length: 120 }).map((_, i) => ({
    sku: `SKU${i+1}`.padStart(5, '0'),
    name: basket[i%basket.length] + (i < 20 ? '' : ` ${i}`),
    category: categories[i%categories.length],
    brand: 'Marca '+((i%5)+1),
    unit: 'un',
    is_active: true,
    created_at: new Date().toISOString()
  }));
  await supabase.from('products').insert(prods);
  // Pedidos
  const now = Date.now();
  let orderId = 1;
  for (let m = 0; m < 9; m++) {
    for (let c = 0; c < 80; c++) {
      const order_date = new Date(now - (m*30+randomInt(0,29))*86400000).toISOString();
      const total_value = randomInt(100, 500).toString();
      const { data: order } = await supabase.from('orders').insert({
        customer_id: c+1,
        order_code: `O${orderId++}`,
        order_date,
        total_value,
        created_at: order_date
      }).select('id').single();
      if (!order) continue;
      // Itens correlacionados
      const items = basket.map((name, idx) => ({
        order_id: order.id,
        product_id: (idx + (c%basket.length)*basket.length + 1),
        quantity: randomInt(1, 5).toString(),
        unit_price: randomInt(5, 20).toString(),
        line_total: randomInt(10, 100).toString()
      }));
      await supabase.from('order_items').insert(items);
    }
  }
  await recomputeStats();
  await recomputeAssociations();
  await generateRecommendations({});
  await runRecompraAlerts();
  return NextResponse.json({ seeded: true });
}
