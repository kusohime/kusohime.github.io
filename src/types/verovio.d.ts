declare module "verovio/wasm" {
  export default function createVerovioModule(
    options?: Record<string, unknown>,
  ): Promise<unknown>;
}

declare module "verovio/esm" {
  export class VerovioToolkit {
    constructor(module: unknown);
    destroy(): void;
    renderData(data: string, options: Record<string, unknown>): string;
  }
}
