// Shown instantly while the server renders /discover or /discover/matches,
// so tab switches never feel frozen.
export default function Loading() {
  return <div className="skel" aria-busy="true" aria-label="Loading" />;
}
