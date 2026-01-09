import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { cn } from '@/lib/utils';

const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getSessionPoint(session) {
  if (!session) return null;
  if (Number.isFinite(session.gps_lat) && Number.isFinite(session.gps_lng)) {
    return { lat: session.gps_lat, lng: session.gps_lng, source: 'gps' };
  }
  if (Number.isFinite(session.ip_lat) && Number.isFinite(session.ip_lng)) {
    return { lat: session.ip_lat, lng: session.ip_lng, source: 'ip' };
  }
  return null;
}

export function ConnectedUsersMap({ sessions = [], className }) {
  const points = useMemo(() => {
    return sessions
      .map((s) => {
        const p = getSessionPoint(s);
        if (!p) return null;
        return { session: s, ...p };
      })
      .filter(Boolean);
  }, [sessions]);

  const center = useMemo(() => {
    if (!points.length) return [20, 0];
    const sum = points.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 }
    );
    return [sum.lat / points.length, sum.lng / points.length];
  }, [points]);

  if (!points.length) {
    return (
      <div
        className={cn(
          'h-72 w-full rounded-2xl border bg-white/70 border-slate-200/70 flex items-center justify-center',
          'dark:bg-slate-900/20 dark:border-slate-800/60',
          className
        )}
      >
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">No location data yet</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-72 w-full overflow-hidden rounded-2xl border',
        'border-slate-200/70 bg-white/70',
        'dark:border-slate-800/60 dark:bg-slate-900/20',
        className
      )}
    >
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((p) => (
          <Marker
            key={p.session.id}
            position={[p.lat, p.lng]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-black">{p.session.username}</div>
                <div className="opacity-80">{String(p.session.role || '').toUpperCase()}</div>
                <div className="opacity-80">source: {p.source}</div>
                {p.session.ip_city || p.session.ip_country ? (
                  <div className="opacity-80">
                    {p.session.ip_city ? `${p.session.ip_city}, ` : ''}
                    {p.session.ip_country || ''}
                  </div>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
