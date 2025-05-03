declare module 'quagga' {
  interface QuaggaInitConfig {
    inputStream?: {
      name?: string;
      type?: string;
      target?: HTMLElement | null;
      constraints?: {
        width?: number | { min?: number; ideal?: number; max?: number };
        height?: number | { min?: number; ideal?: number; max?: number };
        aspectRatio?: { min?: number; max?: number };
        facingMode?: string;
        deviceId?: string;
      };
      singleChannel?: boolean;
      area?: {
        top?: string | number;
        right?: string | number;
        left?: string | number;
        bottom?: string | number;
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    decoder?: {
      readers?: string[];
      multiple?: boolean;
      debug?: {
        drawBoundingBox?: boolean;
        showFrequency?: boolean;
        drawScanline?: boolean;
        showPattern?: boolean;
      };
    };
    locate?: boolean;
    area?: {
      top?: string;
      right?: string;
      left?: string;
      bottom?: string;
    };
    frequency?: number;
  }

  interface QuaggaResult {
    codeResult?: {
      code?: string;
      format?: string;
    };
    box?: number[][];
    boxes?: number[][][];
    line?: { x: number; y: number }[];
  }

  interface QuaggaCanvas {
    ctx: {
      overlay: CanvasRenderingContext2D;
    };
    dom: {
      overlay: HTMLCanvasElement;
    };
  }

  const Quagga: {
    init: (config: QuaggaInitConfig, callback?: (err: Error | null) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (result: QuaggaResult) => void) => void;
    onProcessed: (callback: (result: QuaggaResult | undefined) => void) => void;
    canvas: QuaggaCanvas;
    ImageDebug: {
      drawPath: (path: any, start: any, ctx: CanvasRenderingContext2D, style: any) => void;
    };
  };

  export default Quagga;
}
