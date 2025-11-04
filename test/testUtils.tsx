import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../src/components/ui/ThemeProvider';

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>;

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
