import { ref, computed, onMounted, readonly } from 'vue';
import type { 
  ThemeName, 
  CustomTheme, 
  PredefinedTheme, 
  ThemeState, 
  ThemeManagerState,
  CreateThemeFormData,
  ThemeColors,
  ThemeValidationResult,
  ThemeImportExport,
  ThemeApiResponse
} from '../types/theme';
import { PREDEFINED_THEME_NAMES, COLOR_REGEX, RGBA_REGEX } from '../types/theme';

// Predefined themes configuration
const PREDEFINED_THEMES: Record<ThemeName, PredefinedTheme> = {
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Clean and bright theme with high contrast',
    cssClass: 'theme-light',
    preview: { primary: '#ffffff', secondary: '#f9fafb', accent: '#3b82f6' },
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#dbeafe',
      primaryDark: '#1e40af',
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      bgTertiary: '#f3f4f6',
      bgQuaternary: '#e5e7eb',
      textPrimary: '#111827',
      textSecondary: '#374151',
      textTertiary: '#6b7280',
      textQuaternary: '#9ca3af',
      borderPrimary: '#e5e7eb',
      borderSecondary: '#d1d5db',
      borderTertiary: '#9ca3af',
      accentSuccess: '#10b981',
      accentWarning: '#f59e0b',
      accentError: '#ef4444',
      accentInfo: '#3b82f6',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowLg: 'rgba(0, 0, 0, 0.25)',
      hoverBg: 'rgba(0, 0, 0, 0.05)',
      activeBg: 'rgba(0, 0, 0, 0.1)',
      focusRing: '#3b82f6'
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: 'Dark theme with reduced eye strain',
    cssClass: 'theme-dark',
    preview: { primary: '#111827', secondary: '#1f2937', accent: '#60a5fa' },
    colors: {
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      primaryLight: '#1e3a8a',
      primaryDark: '#1d4ed8',
      bgPrimary: '#111827',
      bgSecondary: '#1f2937',
      bgTertiary: '#374151',
      bgQuaternary: '#4b5563',
      textPrimary: '#f9fafb',
      textSecondary: '#e5e7eb',
      textTertiary: '#d1d5db',
      textQuaternary: '#9ca3af',
      borderPrimary: '#374151',
      borderSecondary: '#4b5563',
      borderTertiary: '#6b7280',
      accentSuccess: '#34d399',
      accentWarning: '#fbbf24',
      accentError: '#f87171',
      accentInfo: '#60a5fa',
      shadow: 'rgba(0, 0, 0, 0.5)',
      shadowLg: 'rgba(0, 0, 0, 0.75)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      activeBg: 'rgba(255, 255, 255, 0.1)',
      focusRing: '#60a5fa'
    }
  },
  modern: {
    name: 'modern',
    displayName: 'Modern',
    description: 'Sleek modern theme with blue accents',
    cssClass: 'theme-modern',
    preview: { primary: '#f8fafc', secondary: '#f1f5f9', accent: '#0ea5e9' },
    colors: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      primaryLight: '#e0f2fe',
      primaryDark: '#0c4a6e',
      bgPrimary: '#f8fafc',
      bgSecondary: '#f1f5f9',
      bgTertiary: '#e2e8f0',
      bgQuaternary: '#cbd5e1',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textTertiary: '#64748b',
      textQuaternary: '#94a3b8',
      borderPrimary: '#e2e8f0',
      borderSecondary: '#cbd5e1',
      borderTertiary: '#94a3b8',
      accentSuccess: '#059669',
      accentWarning: '#d97706',
      accentError: '#dc2626',
      accentInfo: '#0ea5e9',
      shadow: 'rgba(15, 23, 42, 0.1)',
      shadowLg: 'rgba(15, 23, 42, 0.25)',
      hoverBg: 'rgba(15, 23, 42, 0.05)',
      activeBg: 'rgba(15, 23, 42, 0.1)',
      focusRing: '#0ea5e9'
    }
  },
  earth: {
    name: 'earth',
    displayName: 'Earth',
    description: 'Natural theme with warm earth tones',
    cssClass: 'theme-earth',
    preview: { primary: '#f5f5dc', secondary: '#d2b48c', accent: '#8b4513' },
    colors: {
      primary: '#8b4513',
      primaryHover: '#a0522d',
      primaryLight: '#deb887',
      primaryDark: '#654321',
      bgPrimary: '#f5f5dc',
      bgSecondary: '#f0e68c',
      bgTertiary: '#daa520',
      bgQuaternary: '#cd853f',
      textPrimary: '#2f1b14',
      textSecondary: '#5d4e37',
      textTertiary: '#8b4513',
      textQuaternary: '#a0522d',
      borderPrimary: '#deb887',
      borderSecondary: '#d2b48c',
      borderTertiary: '#cd853f',
      accentSuccess: '#228b22',
      accentWarning: '#ff8c00',
      accentError: '#dc143c',
      accentInfo: '#4682b4',
      shadow: 'rgba(139, 69, 19, 0.15)',
      shadowLg: 'rgba(139, 69, 19, 0.3)',
      hoverBg: 'rgba(139, 69, 19, 0.08)',
      activeBg: 'rgba(139, 69, 19, 0.15)',
      focusRing: '#8b4513'
    }
  },
  glass: {
    name: 'glass',
    displayName: 'Glass',
    description: 'Frosted glass theme with vibrant purple accents',
    cssClass: 'theme-glass',
    preview: { primary: '#e6e6fa', secondary: '#dda0dd', accent: '#9370db' },
    colors: {
      primary: '#9370db',
      primaryHover: '#8a2be2',
      primaryLight: '#e6e6fa',
      primaryDark: '#4b0082',
      bgPrimary: '#f8f8ff',
      bgSecondary: '#e6e6fa',
      bgTertiary: '#dda0dd',
      bgQuaternary: '#d8bfd8',
      textPrimary: '#2e1065',
      textSecondary: '#5b21b6',
      textTertiary: '#7c3aed',
      textQuaternary: '#8b5cf6',
      borderPrimary: '#dda0dd',
      borderSecondary: '#d8bfd8',
      borderTertiary: '#c8a2c8',
      accentSuccess: '#32cd32',
      accentWarning: '#ffa500',
      accentError: '#ff1493',
      accentInfo: '#9370db',
      shadow: 'rgba(147, 112, 219, 0.2)',
      shadowLg: 'rgba(147, 112, 219, 0.4)',
      hoverBg: 'rgba(147, 112, 219, 0.1)',
      activeBg: 'rgba(147, 112, 219, 0.2)',
      focusRing: '#9370db'
    }
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'High Contrast',
    description: 'Maximum contrast theme for accessibility',
    cssClass: 'theme-high-contrast',
    preview: { primary: '#ffffff', secondary: '#f0f0f0', accent: '#000000' },
    colors: {
      primary: '#000000',
      primaryHover: '#333333',
      primaryLight: '#f0f0f0',
      primaryDark: '#000000',
      bgPrimary: '#ffffff',
      bgSecondary: '#f0f0f0',
      bgTertiary: '#e0e0e0',
      bgQuaternary: '#d0d0d0',
      textPrimary: '#000000',
      textSecondary: '#000000',
      textTertiary: '#333333',
      textQuaternary: '#666666',
      borderPrimary: '#000000',
      borderSecondary: '#333333',
      borderTertiary: '#666666',
      accentSuccess: '#008000',
      accentWarning: '#ff8c00',
      accentError: '#ff0000',
      accentInfo: '#0000ff',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowLg: 'rgba(0, 0, 0, 0.6)',
      hoverBg: 'rgba(0, 0, 0, 0.1)',
      activeBg: 'rgba(0, 0, 0, 0.2)',
      focusRing: '#000000'
    }
  },
  'dark-blue': {
    name: 'dark-blue',
    displayName: 'Dark Blue',
    description: 'Deep blue theme with navy accents',
    cssClass: 'theme-dark-blue',
    preview: { primary: '#000033', secondary: '#000066', accent: '#0099ff' },
    colors: {
      primary: '#0099ff',
      primaryHover: '#0077cc',
      primaryLight: '#33aaff',
      primaryDark: '#0066cc',
      bgPrimary: '#000033',
      bgSecondary: '#000066',
      bgTertiary: '#000099',
      bgQuaternary: '#0000cc',
      textPrimary: '#e6f2ff',
      textSecondary: '#ccddff',
      textTertiary: '#99bbff',
      textQuaternary: '#6699ff',
      borderPrimary: '#003366',
      borderSecondary: '#004499',
      borderTertiary: '#0066cc',
      accentSuccess: '#00ff88',
      accentWarning: '#ffaa00',
      accentError: '#ff3366',
      accentInfo: '#0099ff',
      shadow: 'rgba(0, 0, 51, 0.7)',
      shadowLg: 'rgba(0, 0, 51, 0.9)',
      hoverBg: 'rgba(0, 153, 255, 0.15)',
      activeBg: 'rgba(0, 153, 255, 0.25)',
      focusRing: '#0099ff'
    }
  },
  'colorblind-friendly': {
    name: 'colorblind-friendly',
    displayName: 'Colorblind Friendly',
    description: 'High contrast colors safe for color vision deficiency',
    cssClass: 'theme-colorblind-friendly',
    preview: { primary: '#ffffcc', secondary: '#ffcc99', accent: '#993366' },
    colors: {
      primary: '#993366',
      primaryHover: '#663344',
      primaryLight: '#cc6699',
      primaryDark: '#661144',
      bgPrimary: '#ffffcc',
      bgSecondary: '#ffcc99',
      bgTertiary: '#ffaa88',
      bgQuaternary: '#ff9966',
      textPrimary: '#331122',
      textSecondary: '#442233',
      textTertiary: '#553344',
      textQuaternary: '#664455',
      borderPrimary: '#cc9966',
      borderSecondary: '#996633',
      borderTertiary: '#663300',
      accentSuccess: '#117733',
      accentWarning: '#cc6633',
      accentError: '#882233',
      accentInfo: '#993366',
      shadow: 'rgba(51, 17, 34, 0.15)',
      shadowLg: 'rgba(51, 17, 34, 0.3)',
      hoverBg: 'rgba(153, 51, 102, 0.08)',
      activeBg: 'rgba(153, 51, 102, 0.15)',
      focusRing: '#993366'
    }
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Bright tropical ocean with turquoise and coral accents',
    cssClass: 'theme-ocean',
    preview: { primary: '#cceeff', secondary: '#66ccff', accent: '#0088cc' },
    colors: {
      primary: '#0088cc',
      primaryHover: '#006699',
      primaryLight: '#33aadd',
      primaryDark: '#005588',
      bgPrimary: '#cceeff',
      bgSecondary: '#99ddff',
      bgTertiary: '#66ccff',
      bgQuaternary: '#33bbff',
      textPrimary: '#003344',
      textSecondary: '#004455',
      textTertiary: '#005566',
      textQuaternary: '#006677',
      borderPrimary: '#66bbdd',
      borderSecondary: '#4499cc',
      borderTertiary: '#2288bb',
      accentSuccess: '#00cc66',
      accentWarning: '#ff9933',
      accentError: '#ff3333',
      accentInfo: '#0088cc',
      shadow: 'rgba(0, 136, 204, 0.15)',
      shadowLg: 'rgba(0, 136, 204, 0.3)',
      hoverBg: 'rgba(0, 136, 204, 0.08)',
      activeBg: 'rgba(0, 136, 204, 0.15)',
      focusRing: '#0088cc'
    }
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm sunset colors with orange and pink gradients',
    cssClass: 'theme-sunset',
    preview: { primary: '#ffedd5', secondary: '#fed7aa', accent: '#ea580c' },
    colors: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      primaryLight: '#fed7aa',
      primaryDark: '#9a3412',
      bgPrimary: '#fff7ed',
      bgSecondary: '#ffedd5',
      bgTertiary: '#fed7aa',
      bgQuaternary: '#fdba74',
      textPrimary: '#431407',
      textSecondary: '#9a3412',
      textTertiary: '#c2410c',
      textQuaternary: '#ea580c',
      borderPrimary: '#fed7aa',
      borderSecondary: '#fdba74',
      borderTertiary: '#fb923c',
      accentSuccess: '#16a34a',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#ea580c',
      shadow: 'rgba(234, 88, 12, 0.15)',
      shadowLg: 'rgba(234, 88, 12, 0.3)',
      hoverBg: 'rgba(234, 88, 12, 0.08)',
      activeBg: 'rgba(234, 88, 12, 0.15)',
      focusRing: '#ea580c'
    }
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    description: 'Deep forest greens with natural wood accents',
    cssClass: 'theme-forest',
    preview: { primary: '#dcfce7', secondary: '#bbf7d0', accent: '#16a34a' },
    colors: {
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryLight: '#bbf7d0',
      primaryDark: '#14532d',
      bgPrimary: '#f0fdf4',
      bgSecondary: '#dcfce7',
      bgTertiary: '#bbf7d0',
      bgQuaternary: '#86efac',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textTertiary: '#15803d',
      textQuaternary: '#16a34a',
      borderPrimary: '#bbf7d0',
      borderSecondary: '#86efac',
      borderTertiary: '#4ade80',
      accentSuccess: '#22c55e',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#16a34a',
      shadow: 'rgba(22, 163, 74, 0.15)',
      shadowLg: 'rgba(22, 163, 74, 0.3)',
      hoverBg: 'rgba(22, 163, 74, 0.08)',
      activeBg: 'rgba(22, 163, 74, 0.15)',
      focusRing: '#16a34a'
    }
  },
  neon: {
    name: 'neon',
    displayName: 'Neon',
    description: 'Vibrant cyberpunk theme with electric colors',
    cssClass: 'theme-neon',
    preview: { primary: '#0a0a0a', secondary: '#1a1a1a', accent: '#00ff00' },
    colors: {
      primary: '#00ff00',
      primaryHover: '#00cc00',
      primaryLight: '#80ff80',
      primaryDark: '#009900',
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#2a2a2a',
      bgQuaternary: '#3a3a3a',
      textPrimary: '#00ff00',
      textSecondary: '#80ff80',
      textTertiary: '#ccffcc',
      textQuaternary: '#e6ffe6',
      borderPrimary: '#00cc00',
      borderSecondary: '#00aa00',
      borderTertiary: '#008800',
      accentSuccess: '#00ff80',
      accentWarning: '#ffff00',
      accentError: '#ff0080',
      accentInfo: '#00ffff',
      shadow: 'rgba(0, 255, 0, 0.3)',
      shadowLg: 'rgba(0, 255, 0, 0.5)',
      hoverBg: 'rgba(0, 255, 0, 0.1)',
      activeBg: 'rgba(0, 255, 0, 0.2)',
      focusRing: '#00ff00'
    }
  },
  vintage: {
    name: 'vintage',
    displayName: 'Vintage',
    description: 'Retro sepia theme with aged paper appearance',
    cssClass: 'theme-vintage',
    preview: { primary: '#f5f5dc', secondary: '#deb887', accent: '#8b4513' },
    colors: {
      primary: '#8b4513',
      primaryHover: '#a0522d',
      primaryLight: '#deb887',
      primaryDark: '#654321',
      bgPrimary: '#faf0e6',
      bgSecondary: '#f5f5dc',
      bgTertiary: '#f0e68c',
      bgQuaternary: '#deb887',
      textPrimary: '#2f1b14',
      textSecondary: '#654321',
      textTertiary: '#8b4513',
      textQuaternary: '#a0522d',
      borderPrimary: '#deb887',
      borderSecondary: '#d2b48c',
      borderTertiary: '#bc9a6a',
      accentSuccess: '#6b8e23',
      accentWarning: '#ff8c00',
      accentError: '#cd5c5c',
      accentInfo: '#4682b4',
      shadow: 'rgba(139, 69, 19, 0.2)',
      shadowLg: 'rgba(139, 69, 19, 0.4)',
      hoverBg: 'rgba(139, 69, 19, 0.1)',
      activeBg: 'rgba(139, 69, 19, 0.2)',
      focusRing: '#8b4513'
    }
  },
  arctic: {
    name: 'arctic',
    displayName: 'Arctic',
    description: 'Cool whites and blues inspired by arctic landscapes',
    cssClass: 'theme-arctic',
    preview: { primary: '#f0f9ff', secondary: '#e0f2fe', accent: '#0369a1' },
    colors: {
      primary: '#0369a1',
      primaryHover: '#0284c7',
      primaryLight: '#e0f2fe',
      primaryDark: '#164e63',
      bgPrimary: '#f8fafc',
      bgSecondary: '#f0f9ff',
      bgTertiary: '#e0f2fe',
      bgQuaternary: '#bae6fd',
      textPrimary: '#0c4a6e',
      textSecondary: '#164e63',
      textTertiary: '#0369a1',
      textQuaternary: '#0284c7',
      borderPrimary: '#e0f2fe',
      borderSecondary: '#bae6fd',
      borderTertiary: '#7dd3fc',
      accentSuccess: '#059669',
      accentWarning: '#d97706',
      accentError: '#dc2626',
      accentInfo: '#0369a1',
      shadow: 'rgba(3, 105, 161, 0.1)',
      shadowLg: 'rgba(3, 105, 161, 0.25)',
      hoverBg: 'rgba(3, 105, 161, 0.05)',
      activeBg: 'rgba(3, 105, 161, 0.1)',
      focusRing: '#0369a1'
    }
  },
  lavender: {
    name: 'lavender',
    displayName: 'Lavender',
    description: 'Soft purple theme with gentle pastel colors',
    cssClass: 'theme-lavender',
    preview: { primary: '#faf5ff', secondary: '#f3e8ff', accent: '#9333ea' },
    colors: {
      primary: '#9333ea',
      primaryHover: '#7c3aed',
      primaryLight: '#f3e8ff',
      primaryDark: '#581c87',
      bgPrimary: '#fefcff',
      bgSecondary: '#faf5ff',
      bgTertiary: '#f3e8ff',
      bgQuaternary: '#e9d5ff',
      textPrimary: '#581c87',
      textSecondary: '#6b21a8',
      textTertiary: '#7c3aed',
      textQuaternary: '#8b5cf6',
      borderPrimary: '#f3e8ff',
      borderSecondary: '#e9d5ff',
      borderTertiary: '#d8b4fe',
      accentSuccess: '#059669',
      accentWarning: '#d97706',
      accentError: '#dc2626',
      accentInfo: '#9333ea',
      shadow: 'rgba(147, 51, 234, 0.1)',
      shadowLg: 'rgba(147, 51, 234, 0.25)',
      hoverBg: 'rgba(147, 51, 234, 0.05)',
      activeBg: 'rgba(147, 51, 234, 0.1)',
      focusRing: '#9333ea'
    }
  },
  copper: {
    name: 'copper',
    displayName: 'Copper',
    description: 'Industrial theme with copper and bronze tones',
    cssClass: 'theme-copper',
    preview: { primary: '#fed7aa', secondary: '#fdba74', accent: '#c2410c' },
    colors: {
      primary: '#c2410c',
      primaryHover: '#ea580c',
      primaryLight: '#fed7aa',
      primaryDark: '#9a3412',
      bgPrimary: '#fef2f2',
      bgSecondary: '#fed7aa',
      bgTertiary: '#fdba74',
      bgQuaternary: '#fb923c',
      textPrimary: '#431407',
      textSecondary: '#9a3412',
      textTertiary: '#c2410c',
      textQuaternary: '#ea580c',
      borderPrimary: '#fed7aa',
      borderSecondary: '#fdba74',
      borderTertiary: '#fb923c',
      accentSuccess: '#16a34a',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#c2410c',
      shadow: 'rgba(194, 65, 12, 0.15)',
      shadowLg: 'rgba(194, 65, 12, 0.3)',
      hoverBg: 'rgba(194, 65, 12, 0.08)',
      activeBg: 'rgba(194, 65, 12, 0.15)',
      focusRing: '#c2410c'
    }
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Ultra-dark theme with deep purples and blues',
    cssClass: 'theme-midnight',
    preview: { primary: '#0f0f23', secondary: '#1e1e3f', accent: '#4338ca' },
    colors: {
      primary: '#4338ca',
      primaryHover: '#3730a3',
      primaryLight: '#6366f1',
      primaryDark: '#312e81',
      bgPrimary: '#0f0f23',
      bgSecondary: '#1e1e3f',
      bgTertiary: '#312e81',
      bgQuaternary: '#3730a3',
      textPrimary: '#e0e7ff',
      textSecondary: '#c7d2fe',
      textTertiary: '#a5b4fc',
      textQuaternary: '#818cf8',
      borderPrimary: '#312e81',
      borderSecondary: '#3730a3',
      borderTertiary: '#4338ca',
      accentSuccess: '#16a34a',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#4338ca',
      shadow: 'rgba(67, 56, 202, 0.3)',
      shadowLg: 'rgba(67, 56, 202, 0.5)',
      hoverBg: 'rgba(67, 56, 202, 0.1)',
      activeBg: 'rgba(67, 56, 202, 0.2)',
      focusRing: '#4338ca'
    }
  },
  coral: {
    name: 'coral',
    displayName: 'Coral',
    description: 'Bright coral and teal theme inspired by coral reefs',
    cssClass: 'theme-coral',
    preview: { primary: '#fef2f2', secondary: '#fecaca', accent: '#ef4444' },
    colors: {
      primary: '#ef4444',
      primaryHover: '#dc2626',
      primaryLight: '#fecaca',
      primaryDark: '#b91c1c',
      bgPrimary: '#fffbeb',
      bgSecondary: '#fef2f2',
      bgTertiary: '#fecaca',
      bgQuaternary: '#fca5a5',
      textPrimary: '#7f1d1d',
      textSecondary: '#991b1b',
      textTertiary: '#b91c1c',
      textQuaternary: '#dc2626',
      borderPrimary: '#fecaca',
      borderSecondary: '#fca5a5',
      borderTertiary: '#f87171',
      accentSuccess: '#059669',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#0891b2',
      shadow: 'rgba(239, 68, 68, 0.15)',
      shadowLg: 'rgba(239, 68, 68, 0.3)',
      hoverBg: 'rgba(239, 68, 68, 0.08)',
      activeBg: 'rgba(239, 68, 68, 0.15)',
      focusRing: '#ef4444'
    }
  },
  slate: {
    name: 'slate',
    displayName: 'Slate',
    description: 'Professional gray theme with blue-gray accents',
    cssClass: 'theme-slate',
    preview: { primary: '#f8fafc', secondary: '#f1f5f9', accent: '#475569' },
    colors: {
      primary: '#475569',
      primaryHover: '#334155',
      primaryLight: '#e2e8f0',
      primaryDark: '#1e293b',
      bgPrimary: '#f8fafc',
      bgSecondary: '#f1f5f9',
      bgTertiary: '#e2e8f0',
      bgQuaternary: '#cbd5e1',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textTertiary: '#334155',
      textQuaternary: '#475569',
      borderPrimary: '#e2e8f0',
      borderSecondary: '#cbd5e1',
      borderTertiary: '#94a3b8',
      accentSuccess: '#059669',
      accentWarning: '#eab308',
      accentError: '#dc2626',
      accentInfo: '#475569',
      shadow: 'rgba(71, 85, 105, 0.1)',
      shadowLg: 'rgba(71, 85, 105, 0.25)',
      hoverBg: 'rgba(71, 85, 105, 0.05)',
      activeBg: 'rgba(71, 85, 105, 0.1)',
      focusRing: '#475569'
    }
  }
};

export function useThemes() {
  // State
  const state = ref<ThemeState>({
    currentTheme: 'light',
    customThemes: [],
    isCustomTheme: false,
    isLoading: false,
    error: null
  });

  const managerState = ref<ThemeManagerState>({
    isOpen: false,
    activeTab: 'predefined',
    previewTheme: null,
    editingTheme: null
  });

  // Computed properties
  const currentThemeData = computed(() => {
    if (state.value.isCustomTheme) {
      return state.value.customThemes.find(t => t.id === state.value.currentTheme);
    }
    return PREDEFINED_THEMES[state.value.currentTheme as ThemeName];
  });

  const predefinedThemes = computed(() => Object.values(PREDEFINED_THEMES));

  // Core theme management
  const setTheme = (theme: ThemeName | string) => {
    const isCustom = !PREDEFINED_THEME_NAMES.includes(theme as ThemeName);
    
    if (isCustom) {
      const customTheme = state.value.customThemes.find(t => t.id === theme);
      if (!customTheme) {
        console.error(`Custom theme not found: ${theme}`);
        return;
      }
      applyCustomTheme(customTheme);
    } else {
      applyPredefinedTheme(theme as ThemeName);
    }

    state.value.currentTheme = theme;
    state.value.isCustomTheme = isCustom;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('isCustomTheme', isCustom.toString());
  };

  const applyPredefinedTheme = (themeName: ThemeName) => {
    // Remove all theme classes (including those with hyphens)
    document.documentElement.className = document.documentElement.className
      .replace(/theme-[\w-]+/g, '');
    
    // Add new theme class
    const themeData = PREDEFINED_THEMES[themeName];
    if (themeData) {
      document.documentElement.classList.add(themeData.cssClass);
      
      // For backward compatibility with existing dark mode
      if (themeName === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const applyCustomTheme = (theme: CustomTheme) => {
    // Remove all theme classes (including those with hyphens)
    document.documentElement.className = document.documentElement.className
      .replace(/theme-[\w-]+/g, '');
    
    // Apply custom CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = camelToKebab(key);
      root.style.setProperty(`--theme-${cssVar}`, value);
    });
    
    // Add custom theme class
    root.classList.add('theme-custom');
  };

  // Theme validation
  const validateTheme = (colors: Partial<ThemeColors>): ThemeValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    Object.entries(colors).forEach(([key, value]) => {
      if (!value) {
        errors.push(`${key} is required`);
        return;
      }

      if (!isValidColor(value)) {
        errors.push(`${key} must be a valid color (hex, rgb, or rgba)`);
      }
    });

    // Check contrast ratios (simplified)
    if (colors.textPrimary && colors.bgPrimary) {
      const contrast = calculateContrast(colors.textPrimary, colors.bgPrimary);
      if (contrast < 4.5) {
        warnings.push('Primary text and background may not meet accessibility contrast requirements');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Custom theme management
  const createCustomTheme = async (formData: CreateThemeFormData): Promise<CustomTheme | null> => {
    const validation = validateTheme(formData.colors as ThemeColors);
    if (!validation.isValid) {
      state.value.error = validation.errors.join(', ');
      return null;
    }

    const theme: CustomTheme = {
      id: generateId(),
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      colors: formData.colors as ThemeColors,
      isCustom: true,
      isPublic: formData.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: formData.tags
    };

    // Save locally
    state.value.customThemes.push(theme);
    saveCustomThemes();

    // Save to server if requested
    if (formData.isPublic) {
      try {
        await saveThemeToServer(theme);
      } catch (error) {
        console.warn('Failed to save theme to server:', error);
      }
    }

    return theme;
  };

  const updateCustomTheme = (themeId: string, updates: Partial<CustomTheme>) => {
    const index = state.value.customThemes.findIndex(t => t.id === themeId);
    if (index !== -1) {
      state.value.customThemes[index] = {
        ...state.value.customThemes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveCustomThemes();
    }
  };

  const deleteCustomTheme = (themeId: string) => {
    const index = state.value.customThemes.findIndex(t => t.id === themeId);
    if (index !== -1) {
      state.value.customThemes.splice(index, 1);
      saveCustomThemes();
      
      // Switch to default theme if current theme was deleted
      if (state.value.currentTheme === themeId) {
        setTheme('light');
      }
    }
  };

  // Import/Export
  const exportTheme = (themeId: string): ThemeImportExport | null => {
    const theme = state.value.customThemes.find(t => t.id === themeId);
    if (!theme) return null;

    return {
      version: '1.0.0',
      theme,
      exportedAt: new Date().toISOString(),
      exportedBy: 'observability-system'
    };
  };

  const importTheme = (importData: ThemeImportExport): boolean => {
    try {
      const theme = importData.theme;
      
      // Validate theme structure
      const validation = validateTheme(theme.colors);
      if (!validation.isValid) {
        state.value.error = `Invalid theme: ${validation.errors.join(', ')}`;
        return false;
      }

      // Generate new ID to avoid conflicts
      const newTheme: CustomTheme = {
        ...theme,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.value.customThemes.push(newTheme);
      saveCustomThemes();
      return true;
    } catch (error) {
      state.value.error = 'Failed to import theme';
      return false;
    }
  };

  // Server API functions
  const saveThemeToServer = async (theme: CustomTheme): Promise<void> => {
    const response = await fetch('http://localhost:4000/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme)
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to save theme to server');
    }
  };

  const loadThemesFromServer = async (): Promise<CustomTheme[]> => {
    try {
      const response = await fetch('http://localhost:4000/api/themes?isPublic=true');
      if (!response.ok) return [];
      
      const result: ThemeApiResponse<CustomTheme[]> = await response.json();
      if (result.success && result.data) {
        // Convert server themes to custom theme format
        return result.data.map(theme => ({
          ...theme,
          isCustom: true
        }));
      }
      return [];
    } catch (error) {
      console.warn('Failed to load themes from server:', error);
      return [];
    }
  };


  // Utility functions
  const camelToKebab = (str: string) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  };

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const isValidColor = (color: string): boolean => {
    return COLOR_REGEX.test(color) || RGBA_REGEX.test(color) || CSS.supports('color', color);
  };

  const calculateContrast = (_color1: string, _color2: string): number => {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder
  };

  // localStorage functions
  const saveCustomThemes = () => {
    localStorage.setItem('customThemes', JSON.stringify(state.value.customThemes));
  };

  const loadCustomThemes = () => {
    try {
      const stored = localStorage.getItem('customThemes');
      if (stored) {
        state.value.customThemes = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load custom themes from localStorage:', error);
      state.value.customThemes = [];
    }
  };

  // Initialization
  const initializeTheme = () => {
    loadCustomThemes();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  };

  // Manager state functions
  const openThemeManager = () => {
    console.log('Opening theme manager...', managerState.value.isOpen);
    managerState.value.isOpen = true;
    console.log('Theme manager state after:', managerState.value.isOpen);
  };

  const closeThemeManager = () => {
    managerState.value.isOpen = false;
    managerState.value.previewTheme = null;
    managerState.value.editingTheme = null;
  };

  const setActiveTab = (tab: ThemeManagerState['activeTab']) => {
    managerState.value.activeTab = tab;
  };

  const previewTheme = (theme: ThemeName | CustomTheme) => {
    managerState.value.previewTheme = theme;
    
    // Apply preview temporarily
    if (typeof theme === 'string') {
      applyPredefinedTheme(theme);
    } else {
      applyCustomTheme(theme);
    }
  };

  const cancelPreview = () => {
    managerState.value.previewTheme = null;
    
    // Restore current theme
    if (state.value.isCustomTheme) {
      const customTheme = state.value.customThemes.find(t => t.id === state.value.currentTheme);
      if (customTheme) {
        applyCustomTheme(customTheme);
      }
    } else {
      applyPredefinedTheme(state.value.currentTheme as ThemeName);
    }
  };

  const applyPreview = () => {
    if (managerState.value.previewTheme) {
      const theme = typeof managerState.value.previewTheme === 'string' 
        ? managerState.value.previewTheme 
        : managerState.value.previewTheme.id;
      
      setTheme(theme);
      managerState.value.previewTheme = null;
    }
  };

  // Initialize on mount
  onMounted(() => {
    initializeTheme();
  });

  return {
    // State
    state: readonly(state),
    managerState,
    
    // Computed
    currentThemeData,
    predefinedThemes,
    
    // Core functions
    setTheme,
    validateTheme,
    
    // Custom theme management
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    
    // Import/Export
    exportTheme,
    importTheme,
    
    // Manager functions
    openThemeManager,
    closeThemeManager,
    setActiveTab,
    previewTheme,
    cancelPreview,
    applyPreview,
    
    // Server functions
    loadThemesFromServer,
    
    // Utility
    initializeTheme
  };
}