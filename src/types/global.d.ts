interface Window {
  clarity?: {
    (command: string, ...args: any[]): void;
    q?: any[];
  };
}