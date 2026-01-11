import { useMemo, useState } from 'react';
import { StyledCard } from '@/components/ui/StyledCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectedUsersMap } from '@/components/dashboard/ConnectedUsersMap';
import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { LazySection, DashboardSkeleton } from '@/components/common/LazySection';

function shortId(value) {
  if (!value) return '-';
  const s = String(value);
  return s.length > 8 ? s.slice(0, 8) : s;
}

function secondsAgo(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '-';
  return Math.max(0, Math.round((Date.now() - t) / 1000));
}

function formatLocation(session) {
  if (!session) return '-';
  const parts = [session.ip_city, session.ip_region, session.ip_country].filter(Boolean);
  return parts.length ? parts.join(', ') : '-';
}

function formatCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '-';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function ConnectedUsersCard({
  sessions = [],
  loadingSessions,
  history = [],
  loadingHistory,
  counts,
  connectedWindowMs,
}) {
  const connectedWindowLabel = useMemo(() => {
    const s = connectedWindowMs ? connectedWindowMs / 1000 : 1;
    return `${s}s`;
  }, [connectedWindowMs]);

  const [collapsed, setCollapsed] = useLocalStorage('dash:collapsed:connected_users', true, {
    context: 'ConnectedUsersCard',
  });

  const [selectedSessionForMap, setSelectedSessionForMap] = useState(null);

  // Virtual scrolling for large user lists
  const {
    scrollElementRef,
    visibleItems: visibleSessions,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex
  } = useVirtualScroll({
    items: sessions,
    itemHeight: 60,
    containerHeight: 400,
    overscan: 3
  });

  return (
    <StyledCard>
      <div className="dash-section-header">
        <h2 className="dash-section-title">Connected users</h2>
        <div className="dash-section-rule" />
        <div className="flex items-center gap-2 relative z-20">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="dash-collapse-btn"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="dash-meta-pill">
              <span className="opacity-70">Total:</span>
              <span className="tabular-nums">{loadingSessions ? '...' : counts?.total ?? 0}</span>
            </div>
            <div className="dash-meta-pill">
              <span className="opacity-70">Window:</span>
              <span className="tabular-nums">{connectedWindowLabel}</span>
            </div>
            <div className="dash-meta-pill">
              <span className="opacity-70">Super:</span>
              <span className="tabular-nums">{loadingSessions ? '...' : counts?.byRole?.super_admin ?? 0}</span>
            </div>
            <div className="dash-meta-pill">
              <span className="opacity-70">Admin:</span>
              <span className="tabular-nums">{loadingSessions ? '...' : counts?.byRole?.admin ?? 0}</span>
            </div>
            <div className="dash-meta-pill">
              <span className="opacity-70">Sub:</span>
              <span className="tabular-nums">{loadingSessions ? '...' : counts?.byRole?.sub_admin ?? 0}</span>
            </div>
            <div className="dash-meta-pill">
              <span className="opacity-70">Users:</span>
              <span className="tabular-nums">{loadingSessions ? '...' : counts?.byRole?.user ?? 0}</span>
            </div>
          </div>

          <Tabs defaultValue="online">
            <TabsList className="mb-4">
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="online">
              {loadingSessions ? (
                <DashboardSkeleton rows={5} />
              ) : sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No users connected right now.</p>
              ) : (
                <>
                  <LazySection fallback={<DashboardSkeleton rows={5} />}>
                    <div className="overflow-x-auto">
                      <div className="dash-table-shell">
                        <div 
                          ref={scrollElementRef}
                          onScroll={handleScroll}
                          style={{ height: '400px', overflow: 'auto' }}
                        >
                          <div style={{ height: totalHeight, position: 'relative' }}>
                            <table className="min-w-full text-sm">
                              <thead className="dash-table-thead sticky top-0 z-10">
                                <tr className="dash-table-head-row">
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">User</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Role</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Session</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Last seen</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">IP Location</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">IP Coords</th>
                                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">GPS Coords</th>
                                  <th className="py-3 px-4 text-right whitespace-nowrap">Map</th>
                                </tr>
                              </thead>
                              <tbody 
                                className="divide-y divide-slate-200/70 dark:divide-slate-800/40"
                                style={{ transform: `translateY(${offsetY}px)` }}
                              >
                                {visibleSessions.map((s, idx) => (
                                  <tr
                                    key={s.id}
                                    className={(startIndex + idx) % 2 === 0 ? 'bg-slate-900/10 border-b border-slate-800/40' : 'bg-transparent border-b border-slate-800/40'}
                                    style={{ height: '60px' }}
                                  >
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-black">{s.username}</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{String(s.role || '').toUpperCase()}</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{shortId(s.session_id)}</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap tabular-nums">{secondsAgo(s.last_seen_at)}s</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{formatLocation(s)}</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap tabular-nums">{formatCoords(s.ip_lat, s.ip_lng)}</td>
                                    <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap tabular-nums">{formatCoords(s.gps_lat, s.gps_lng)}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setSelectedSessionForMap(selectedSessionForMap === s.id ? null : s.id)}
                                        className="text-xs px-2"
                                      >
                                        {selectedSessionForMap === s.id ? 'Hide' : 'MAP'}
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </LazySection>

                  <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
                    {sessions.slice(0, 50).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border p-4 bg-white/70 border-slate-200/70 dark:bg-slate-900/20 dark:border-slate-800/60"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-black">{s.username}</div>
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {String(s.role || '').toUpperCase()} · {shortId(s.session_id)}
                            </div>
                          </div>
                          <div className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">
                            {secondsAgo(s.last_seen_at)}s
                          </div>
                        </div>

                        <div className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div>IP: {formatLocation(s)}</div>
                          <div>IP coords: {formatCoords(s.ip_lat, s.ip_lng)}</div>
                          <div>GPS coords: {formatCoords(s.gps_lat, s.gps_lng)}</div>
                        </div>

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedSessionForMap(selectedSessionForMap === s.id ? null : s.id)}
                            className="text-xs px-2 w-full"
                          >
                            {selectedSessionForMap === s.id ? 'Hide Map' : 'Show Map'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {sessions.length > 50 && (
                      <div className="text-center text-xs text-slate-500 py-2">
                        Showing first 50 users. Use desktop for full list.
                      </div>
                    )}
                  </div>

                  {selectedSessionForMap && (
                    <div className="mt-4">
                      <ConnectedUsersMap sessions={sessions.filter(s => s.id === selectedSessionForMap)} />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="history">
              {loadingHistory ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-500">No session history yet.</p>
              ) : (
                <div className="dash-table-shell">
                  <table className="min-w-full text-sm">
                    <thead className="dash-table-thead">
                      <tr className="dash-table-head-row">
                        <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">User</th>
                        <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Role</th>
                        <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Session</th>
                        <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Started</th>
                        <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">Ended</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/40">
                      {history.map((h, idx) => (
                        <tr
                          key={h.id}
                          className={idx % 2 === 0 ? 'bg-slate-900/10 border-b border-slate-800/40' : 'bg-transparent border-b border-slate-800/40'}
                        >
                          <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-black">{h.username}</td>
                          <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{String(h.role || '').toUpperCase()}</td>
                          <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{shortId(h.session_id)}</td>
                          <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{h.started_at ? new Date(h.started_at).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">{h.ended_at ? new Date(h.ended_at).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{h.end_reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </StyledCard>
  );
}
