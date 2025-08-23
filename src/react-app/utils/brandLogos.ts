// Brand logo mappings
// Logoene må legges i /public/brand-logos/ mappen
// Format: brand-logos/merkenavn.png (eller .jpg, .svg)

export const getBrandLogoUrl = (brand: string): string | null => {
  // Mapping av merkenavn til logo-filnavn
  const brandLogos: Record<string, string> = {
    'UCS Spirit': 'ucs-spirit.png',
    'Pacer': 'pacer.png',
    'Essx': 'essx.png',
    'Nordic': 'nordic.png',
    'Gill': 'gill.png',
    'Altius': 'altius.png',
  };

  const logoFile = brandLogos[brand];
  if (logoFile) {
    return `/brand-logos/${logoFile}`;
  }
  
  return null;
};

// Fallback farger for merker uten logo
export const getBrandColor = (brand: string): string => {
  const brandColors: Record<string, string> = {
    'UCS Spirit': 'from-red-500 to-orange-500',
    'Pacer': 'from-blue-500 to-blue-600',
    'Essx': 'from-purple-500 to-pink-500',
    'Nordic': 'from-teal-500 to-cyan-500',
    'Gill': 'from-green-500 to-emerald-500',
    'Altius': 'from-indigo-500 to-purple-500',
    'Annen': 'from-gray-500 to-gray-600',
  };

  return brandColors[brand] || 'from-gray-500 to-gray-600';
};