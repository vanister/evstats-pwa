import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#f0fff4' },
          100: { value: '#c6f6d5' },
          200: { value: '#9ae6b4' },
          300: { value: '#68d391' },
          400: { value: '#48bb78' },
          500: { value: '#38a169' },
          600: { value: '#2f855a' },
          700: { value: '#276749' },
          800: { value: '#22543d' },
          900: { value: '#1c4532' },
          950: { value: '#0f2e1f' }
        }
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.brand.700}',
              _dark: '{colors.brand.300}'
            }
          },
          muted: {
            value: {
              _light: '{colors.brand.100}',
              _dark: '{colors.brand.900}'
            }
          },
          subtle: {
            value: { _light: '{colors.brand.50}', _dark: '{colors.brand.950}' }
          },
          emphasized: {
            value: {
              _light: '{colors.brand.200}',
              _dark: '{colors.brand.800}'
            }
          },
          focusRing: { value: '{colors.brand.500}' }
        }
      }
    }
  }
});

const system = createSystem(defaultConfig, config);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
