import MapExplorer from "../components/Drawings";

export const metadata = { title: "Maps — DC Reporting" };

export default function Maps() {
  return (
    <div>
      <div className="eyebrow">PATHFINDER · interactive maps</div>
      <h1 className="title">Site map &amp; construction drawing</h1>
      <p className="sub">Pick a building and a date. The site map shows the campus from above; the construction drawing shows the Level 1 floor plan. Trace your cursor or finger over any area to see its planned work, and the prerequisite and dependent work it is tied to.</p>
      <MapExplorer />
    </div>
  );
}
