import { createServerClient } from './supabase/server';
import { clamp, norm } from './ranking';

export type Customer = { id: number; customer_code: string; name: string; phone?: string; email?: string; segment?: string; region?: string; sales_rep?: string; created_at: string; updated_at: string; };
export type Product = { id: number; sku: string; name: string; category?: string; brand?: string; unit: string; is_active: boolean; created_at: string; };
export type Order = { id: number; customer_id: number; order_code?: string; order_date: string; total_value: string; channel?: string; created_at: string; };
export type OrderItem = { id: number; order_id: number; product_id: number; quantity: string; unit_price: string; line_total: string; };
export type CustomerStats = { customer_id: number; last_order_at?: string; last_order_value?: string; lifetime_value: string; orders_count: number; updated_at: string; };
export type CustomerProductStats = { customer_id: number; product_id: number; first_purchase_at?: string; last_purchase_at?: string; total_qty: string; total_spent: string; purchases_count: number; avg_days_between_purchases?: string; };
export type ProductAssociation = { product_a_id: number; product_b_id: number; support_count: number; support: string; confidence: string; lift: string; leverage: string; window_days: number; updated_at: string; };
export type Recommendation = { id: number; customer_id: number; product_id: number; reason?: string; score?: string; priority?: string; created_at: string; expires_at?: string; };
export type SalesAlert = { id: number; customer_id: number; product_id?: number; alert_type: string; message: string; status: 'open'|'working'|'done'|'ignored'; owner_sales_rep?: string; created_at: string; resolved_at?: string; };

export async function recomputeAssociations(window_days = 0) {
  const supabase = createServerClient();
  // language=PostgreSQL
  const sql = `with pairs as (
    select oi1.product_id as a, oi2.product_id as b, oi1.order_id
    from order_items oi1
    join order_items oi2 
      on oi1.order_id = oi2.order_id 
     and oi1.product_id < oi2.product_id
  ),
  counts as (
    select a, b, count(distinct order_id) as ab_count
    from pairs group by a, b
  ),
  a_counts as (
    select product_id as a, count(distinct order_id) as a_count
    from order_items group by product_id
  ),
  b_counts as (
    select product_id as b, count(distinct order_id) as b_count
    from order_items group by product_id
  ),
  total as (select count(distinct order_id) as n_orders from order_items)
  insert into product_associations (product_a_id, product_b_id, support_count, support, confidence, lift, leverage, window_days)
  select c.a, c.b,
         c.ab_count,
         c.ab_count::decimal / t.n_orders,
         c.ab_count::decimal / ac.a_count,
         (c.ab_count::decimal / ac.a_count) / (bc.b_count::decimal / t.n_orders),
         (c.ab_count::decimal / t.n_orders) - (ac.a_count::decimal / t.n_orders) * (bc.b_count::decimal / t.n_orders),
         0
  from counts c
  join a_counts ac on ac.a = c.a
  join b_counts bc on bc.b = c.b
  cross join total t
  on conflict (product_a_id, product_b_id, window_days) do update
  set support_count = excluded.support_count,
      support = excluded.support,
      confidence = excluded.confidence,
      lift = excluded.lift,
      leverage = excluded.leverage,
      updated_at = now();`;
  await supabase.rpc('execute_sql', { sql });
}

export async function recomputeStats() {
  const supabase = createServerClient();
  // customer_stats
  await supabase.rpc('execute_sql', { sql: `insert into customer_stats (customer_id, last_order_at, last_order_value, lifetime_value, orders_count, updated_at)
    select o.customer_id,
      max(o.order_date),
      (select total_value from orders oo where oo.customer_id = o.customer_id order by order_date desc limit 1),
      sum(o.total_value::decimal)::text,
      count(*),
      now()
    from orders o
    group by o.customer_id
    on conflict (customer_id) do update set
      last_order_at = excluded.last_order_at,
      last_order_value = excluded.last_order_value,
      lifetime_value = excluded.lifetime_value,
      orders_count = excluded.orders_count,
      updated_at = now();` });
  // customer_product_stats
  await supabase.rpc('execute_sql', { sql: `insert into customer_product_stats (customer_id, product_id, first_purchase_at, last_purchase_at, total_qty, total_spent, purchases_count, avg_days_between_purchases)
    select oi.customer_id, oi.product_id,
      min(oi.order_date),
      max(oi.order_date),
      sum(oi.quantity::decimal)::text,
      sum(oi.line_total::decimal)::text,
      count(*),
      case when count(*) > 1 then round(extract(epoch from (max(oi.order_date)::timestamp - min(oi.order_date)::timestamp)) / 86400 / (count(*)-1),1)::text else null end
    from (
      select o.customer_id, oi.product_id, o.order_date, oi.quantity, oi.line_total
      from order_items oi
      join orders o on o.id = oi.order_id
    ) oi
    group by oi.customer_id, oi.product_id
    on conflict (customer_id, product_id) do update set
      first_purchase_at = excluded.first_purchase_at,
      last_purchase_at = excluded.last_purchase_at,
      total_qty = excluded.total_qty,
      total_spent = excluded.total_spent,
      purchases_count = excluded.purchases_count,
      avg_days_between_purchases = excluded.avg_days_between_purchases;` });
}

export async function generateRecommendations({ customerId }: { customerId?: number }) {
  const supabase = createServerClient();
  // Busca clientes
  const customers = customerId
    ? [{ id: customerId }]
    : (await supabase.from('customers').select('id')).data || [];
  for (const customer of customers) {
    // Últimos produtos "A" comprados (90d)
    const { data: lastAs } = await supabase.rpc('execute_sql', {
      sql: `select distinct oi.product_id, max(o.order_date) as last_purchase
            from order_items oi
            join orders o on o.id = oi.order_id
            where o.customer_id = ${customer.id} and o.order_date >= now() - interval '90 days'
            group by oi.product_id`
    });
    if (!lastAs) continue;
    for (const a of lastAs) {
      // Associações B para cada A
      const { data: recs } = await supabase.rpc('execute_sql', {
        sql: `select pa.product_b_id as product_id, pa.lift, pa.confidence, pa.support_count, p.is_active, p.category
              from product_associations pa
              join products p on p.id = pa.product_b_id
              where pa.product_a_id = ${a.product_id}
                and pa.support_count >= 3
                and pa.lift > 1.1
                and p.is_active = true`
      });
      if (!recs) continue;
      for (const rec of recs) {
        // Excluir Bs já comprados nos últimos 30d
        const { data: bought } = await supabase.rpc('execute_sql', {
          sql: `select 1 from order_items oi
                join orders o on o.id = oi.order_id
                where o.customer_id = ${customer.id} and oi.product_id = ${rec.product_id} and o.order_date >= now() - interval '30 days' limit 1`
        });
        if (bought && bought.length) continue;
        // Score
        const normLift = clamp((parseFloat(rec.lift) - 1.0) / (3.0 - 1.0), 0, 1);
        const recencyDays = Math.min(90, Math.max(0, (new Date().getTime() - new Date(a.last_purchase).getTime()) / 86400000));
        const recencyWeight = recencyDays < 30 ? 1 : (recencyDays > 90 ? 0 : 1 - (recencyDays - 30) / 60);
        // Preço médio de B
        let potentialValue = 0.5;
        const { data: priceB } = await supabase.from('order_items').select('unit_price').eq('product_id', rec.product_id).limit(10);
        if (priceB && priceB.length) {
          potentialValue = norm(priceB.map((x:any)=>parseFloat(x.unit_price)).reduce((a:number,b:number)=>a+b,0)/priceB.length, 0, 1000);
        }
        // Reason
        const reason = `Comprou A e clientes semelhantes levam B (lift=${rec.lift}, conf=${rec.confidence})`;
        // Upsert recommendation
        await supabase.from('customer_recommendations').upsert({
          customer_id: customer.id,
          product_id: rec.product_id,
          reason,
          score: (0.5*normLift + 0.3*recencyWeight + 0.2*potentialValue).toFixed(3),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 14*24*60*60*1000).toISOString()
        }, { onConflict: 'customer_id,product_id' });
      }
    }
  }
}

export async function runRecompraAlerts() {
  const supabase = createServerClient();
  // Busca stats
  const { data: stats } = await supabase.from('customer_product_stats').select('*').gte('purchases_count', 2).not('avg_days_between_purchases', 'is', null);
  if (!stats) return;
  for (const stat of stats) {
    const last = new Date(stat.last_purchase_at);
    const avg = parseFloat(stat.avg_days_between_purchases);
    if (!last || !avg) continue;
    const daysSince = (Date.now() - last.getTime()) / 86400000;
    if (daysSince > 1.5 * avg) {
      await supabase.from('sales_alerts').upsert({
        customer_id: stat.customer_id,
        product_id: stat.product_id,
        alert_type: 'recompra',
        message: 'Cliente pode estar no momento de recompra.',
        status: 'open',
        created_at: new Date().toISOString()
      }, { onConflict: 'customer_id,product_id,alert_type' });
    }
  }
}
