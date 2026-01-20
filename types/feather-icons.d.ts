declare module 'feather-icons' {
  type Attrs = Record<string, string | number | boolean | undefined>;

  interface FeatherIcon {
    toSvg(attrs?: Attrs): string;
  }

  interface FeatherModule {
    replace(options?: Attrs): void;
    toSvg(name: string, attrs?: Attrs): string;
    icons: Record<string, FeatherIcon>;
  }

  const feather: FeatherModule;
  export default feather;
}

// Augment the global Window to include the `feather` property added by the CDN script
declare global {
  interface Window {
    feather?: {
      replace(options?: Record<string, string | number | boolean | undefined>): void;
      toSvg(name: string, attrs?: Record<string, string | number | boolean | undefined>): string;
      icons: Record<string, { toSvg(attrs?: Record<string, string | number | boolean | undefined>): string }>;
    };
  }
}

export {};
