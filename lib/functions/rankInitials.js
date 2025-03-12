export function rankToInitials(rank) {
  // Handle empty or invalid input
  if (!rank) return "";

  // Define rank mappings
  const rankMappings = {
    "רב טוראי": 'רב"ט',
    "סמל ראשון": 'סמ"ר',
    "רב סמל": 'רס"ל',
    "רב סמל ראשון": 'רס"ר',
    "סגן אלוף": 'סא"ל',
    "אלוף משנה": 'אל"מ',
    "תת אלוף": 'תא"ל',
  };

  // Return the initials if found, otherwise return the original rank
  return rankMappings[rank] || rank;
}
