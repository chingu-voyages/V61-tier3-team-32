// Thresholds inferred from the Stitch design (45m/orange/"Claim",
// 15m/red/"Claim Now", 2h/green outline/"Claim"). Adjust here if the
// actual design spec gives exact breakpoints.
export function getTimeLeftMinutes(expiresAt) {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export function formatTimeLeft(minutesLeft) {
  if (minutesLeft < 60) return `${minutesLeft}m left`;
  const hours = Math.round(minutesLeft / 60);
  return `${hours}h left`;
}

export function getUrgencyTier(minutesLeft) {
  if (minutesLeft <= 20) {
    return {
      tier: "critical",
      badgeClass: "bg-danger text-white",
      buttonClass: "bg-danger hover:bg-danger/90 text-white",
      buttonLabel: "Claim Now",
    };
  }
  if (minutesLeft <= 60) {
    return {
      tier: "soon",
      badgeClass: "bg-urgency text-white",
      buttonClass: "bg-primary hover:bg-accent text-white",
      buttonLabel: "Claim",
    };
  }
  return {
    tier: "plenty",
    badgeClass: "bg-primary text-white",
    buttonClass: "bg-white text-primary border border-primary hover:bg-primary-light",
    buttonLabel: "Claim",
  };
}