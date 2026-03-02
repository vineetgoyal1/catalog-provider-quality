declare namespace JSX {
  interface IntrinsicElements {
    "ui5-busy-indicator": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        active?: boolean;
        size?: "S" | "M" | "L";
      },
      HTMLElement
    >;
  }
}
