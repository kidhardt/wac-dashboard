import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Institution } from '../types';

interface MapViewProps {
  institutions: Institution[];
  onInstitutionClick?: (institution: Institution) => void;
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapView = ({ institutions, onInstitutionClick }: MapViewProps) => {
  // Calculate center based on all institutions
  const centerLat = institutions.reduce((sum, inst) => sum + inst.coordinates.lat, 0) / institutions.length;
  const centerLng = institutions.reduce((sum, inst) => sum + inst.coordinates.lng, 0) / institutions.length;

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[centerLat || 39.8283, centerLng || -98.5795]} // Default to center of USA
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {institutions.map((institution) => (
          <Marker
            key={institution.id}
            position={[institution.coordinates.lat, institution.coordinates.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                onInstitutionClick?.(institution);
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg text-primary-900 mb-2">
                  {institution.shortName}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">
                    <span className="font-medium">Location:</span> {institution.city}, {institution.state}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Type:</span> {institution.institutionType}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Enrollment:</span> {institution.totalEnrollment.toLocaleString()}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Carnegie:</span> {institution.carnegieClassification}
                  </p>
                  {institution.wacBudget && (
                    <p className="text-slate-600">
                      <span className="font-medium">Budget:</span> ${institution.wacBudget.toLocaleString()}
                    </p>
                  )}
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <a
                      href={institution.wacWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                    >
                      Visit WAC Website →
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
