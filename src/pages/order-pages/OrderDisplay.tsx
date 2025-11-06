// Previous Index of our mockup, it's the individual page for displaying finished and in progress orders.
import { useEffect, useMemo, useRef, useState } from 'react';
import '../../styles/orderdisplay.css';

OrderDisplay.route = {
  path: '/order-display'
};

type OrderItem = {
  id?: string;
  number?: number | string;
  status?: string;
};

function normalizeStatus(status: unknown): 'in_progress' | 'finished' | 'pending' | 'other' {
  if (typeof status !== 'string') return 'other';
  const s = status.trim().toLowerCase();
  if (['in_progress', 'in progress', 'processing', 'progress', 'ongoing'].includes(s)) return 'in_progress';
  if (['finished', 'done', 'completed', 'complete'].includes(s)) return 'finished';
  if (['pending', 'queued', 'waiting'].includes(s)) return 'pending';
  return 'other';
}

export default function OrderDisplay() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const prevStatusByNumberRef = useRef<Record<string, string>>({});
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [enteredIds, setEnteredIds] = useState<Set<string>>(new Set());
  const [landingIds, setLandingIds] = useState<Set<string>>(new Set());
  const [heroNum, setHeroNum] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function safeJson(res: Response) {
      try { return await res.json(); } catch { return null; }
    }

    async function fetchOrders() {
      try {
        // Fetch raw lists in parallel to avoid N+1 dereferencing
        const [hoRes, osRes, coRes] = await Promise.all([
          fetch('/api/raw/HandleOrder', { headers: { 'Accept': 'application/json' } }),
          fetch('/api/raw/OrderStatus', { headers: { 'Accept': 'application/json' } }),
          fetch('/api/raw/CustomerOrder', { headers: { 'Accept': 'application/json' } })
        ]);

        if (!hoRes.ok) throw new Error(`HandleOrder HTTP ${hoRes.status}`);
        if (!osRes.ok) throw new Error(`OrderStatus HTTP ${osRes.status}`);
        if (!coRes.ok) throw new Error(`CustomerOrder HTTP ${coRes.status}`);

        const [hoList, osList, coList] = await Promise.all([
          safeJson(hoRes), safeJson(osRes), safeJson(coRes)
        ]);

        const statusIdToTitle = new Map<string, string>();
        (Array.isArray(osList) ? osList : []).forEach((os: any) => {
          const id = os?.ContentItemId;
          const title = os?.TitlePart?.Title ?? os?.DisplayText;
          if (id && title) statusIdToTitle.set(id, title);
        });

        const customerIdToTitle = new Map<string, string>();
        (Array.isArray(coList) ? coList : []).forEach((co: any) => {
          const id = co?.ContentItemId;
          const title = co?.TitlePart?.Title ?? co?.DisplayText;
          if (id && title) customerIdToTitle.set(id, title);
        });

        const hydrated: OrderItem[] = (Array.isArray(hoList) ? hoList : []).map((ho: any) => {
          const handleOrder = ho?.HandleOrder ?? {};
          const statusId = (handleOrder?.OrderStatus?.ContentItemIds ?? [])[0];
          const customerId = (handleOrder?.CustomerOrder?.ContentItemIds ?? [])[0];
          const statusText = statusId ? statusIdToTitle.get(statusId) : undefined;
          const orderTitle = customerId ? customerIdToTitle.get(customerId) : (ho?.TitlePart?.Title ?? ho?.DisplayText);
          return {
            id: String(orderTitle ?? ho?.ContentItemId ?? ''),
            number: orderTitle ?? ho?.ContentItemId,
            status: statusText,
          } as OrderItem;
        });

        if (isMounted) setOrders(hydrated.filter(Boolean));
      } catch (_) {
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrders();
    return () => { isMounted = false; };
  }, []);

  // Subscribe to SSE updates from backend and live-update orders
  useEffect(() => {
    const evt = new EventSource('/api/sse/orders');
    evt.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === 'snapshot' && Array.isArray(payload.orders)) {
          const next: OrderItem[] = payload.orders.map((o: any) => ({ id: o.id, number: o.number, status: o.status }));
          setOrders(next);
          setLoading(false);
        }
      } catch { /* ignore parse errors */ }
    };
    evt.onerror = () => {
      // keep the existing data; browser will try to reconnect
    };
    return () => { evt.close(); };
  }, []);

  // Detect movements/entries for animations
  useEffect(() => {
    const nextStatusByNumber: Record<string, string> = {};
    for (const o of orders) {
      const key = String(o.number ?? o.id ?? '');
      if (!key) continue;
      nextStatusByNumber[key] = o.status ?? '';
    }

    const prev = prevStatusByNumberRef.current;
    const newPromoted = new Set(promotedIds);
    const newEntered = new Set(enteredIds);
    const newLanding = new Set(landingIds);

    for (const [num, status] of Object.entries(nextStatusByNumber)) {
      const prevStatus = prev[num];
      if (!prevStatus) {
        // new item
        newEntered.add(num);
      } else if (prevStatus !== status) {
        const from = normalizeStatus(prevStatus);
        const to = normalizeStatus(status);
        if (from === 'in_progress' && to === 'finished') {
          // Use overlay hero + landing; skip chip enlarge class
          setHeroNum(num);
          window.setTimeout(() => {
            setHeroNum(null);
            setLandingIds((old) => new Set([...Array.from(old), num]));
            window.setTimeout(() => {
              setLandingIds((old2) => {
                const c = new Set(old2);
                c.delete(num);
                return c;
              });
            }, 2200);
          }, 3600);
        }
      }
    }

    // Update prev snapshot immediately for robust diffing on next payload
    prevStatusByNumberRef.current = nextStatusByNumber;

    if (newPromoted.size || newEntered.size || newLanding.size) {
      setPromotedIds(newPromoted);
      setEnteredIds(newEntered);
      setLandingIds(newLanding);
      // clear general promoted/entered flags after slow animation duration
      const t = setTimeout(() => {
        setPromotedIds(new Set());
        setEnteredIds(new Set());
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [orders]);

  const { inProgressIds, finishedIds } = useMemo(() => {
    const inProg: Array<number | string> = [];
    const done: Array<number | string> = [];
    for (const o of orders) {
      const status = normalizeStatus(o.status);
      const num = o.number ?? o.id;
      if (num === undefined || num === null) continue;
      if (status === 'in_progress') inProg.push(num);
      else if (status === 'finished') done.push(num);
      // pending and others are not shown
    }
    return { inProgressIds: inProg, finishedIds: done };
  }, [orders]);

  return <>
    <div className="order-display-container">
      <section className="orders-section">
        <h2>Pågående beställningar</h2>
        <div className="orders-board">
          {loading ? (
            <div className="order-chip">Laddar...</div>
          ) : (
            inProgressIds.map((num) => (
              <div
                key={String(num)}
                className={`order-chip ${enteredIds.has(String(num)) ? 'order-chip--enter' : ''}`}
              >
                #{num}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="orders-section">
        <h2>Färdiga beställningar</h2>
        <div className="orders-board">
          {loading ? (
            <div className="order-chip order-chip--done">Laddar...</div>
          ) : (
            finishedIds.map((num) => (
              <div
                key={String(num)}
                className={`order-chip order-chip--done ${landingIds.has(String(num)) ? 'order-chip--land' : ''}`}
              >
                #{num}
              </div>
            ))
          )}
        </div>
      </section>
      {heroNum && (
        <div className="order-hero">
          <div className="order-hero__badge">#{heroNum}</div>
        </div>
      )}
    </div>
  </>
}