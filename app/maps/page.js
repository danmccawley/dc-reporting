import MapExplorer from "../components/MapExplorer";

export default function MapsPage() {
  return (
    <div>
      <div className="eyebrow">Interactive maps</div>
      <h1 className="title">Site map &amp; construction drawing</h1>
      <p className="sub">Pick an interval, then select an area by point or by box. Each area shows its status for that reporting interval and links to the matching report.</p>
      <MapExplorer />
    </div>
  );
}
