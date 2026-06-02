import KenyaMap from '../../components/map/KenyaMap';

export default function HostMap() {
  return (
    <div data-role="host" className="flex-1 min-h-0">
      <KenyaMap role="host" />
    </div>
  );
}
