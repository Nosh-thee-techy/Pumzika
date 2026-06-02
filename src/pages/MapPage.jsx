import KenyaMap from '../components/map/KenyaMap';

export default function MapPage() {
  return (
    <div className="flex-1 relative min-h-0">
      <KenyaMap fullScreen />
    </div>
  );
}
