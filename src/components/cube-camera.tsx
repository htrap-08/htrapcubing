import { useEffect, useRef, useState } from "react";

export type RGB = { r: number; g: number; b: number };

/** Sample grid cells in row-major order, from top-left to bottom-right. */
function captureFaceRGB(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  grid: SVGSVGElement,
  n: number,
): RGB[] {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    throw new Error("Wait for a camera frame before scanning.");
  }
  const bounds = video.getBoundingClientRect();
  const matrix = grid.getScreenCTM();
  if (!bounds.width || !bounds.height || !matrix) {
    throw new Error("The camera guide must be visible before scanning.");
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser could not create a frame capture canvas.");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Reverse the centred object-cover crop to locate pixels in the source frame.
  const scale = Math.max(bounds.width / canvas.width, bounds.height / canvas.height);
  const cropX = (canvas.width * scale - bounds.width) / 2;
  const cropY = (canvas.height * scale - bounds.height) / 2;
  // These are the actual cell boundaries used by the SVG path below.
  const edges = Array.from({ length: n + 1 }, (_, i) =>
    i === 0 ? 3 : i === n ? 297 : (i * 300) / n,
  );
  const centres = edges.slice(0, -1).map((edge, index) => (edge + edges[index + 1]!) / 2);
  const samples: RGB[] = [];
  for (const y of centres) {
    for (const x of centres) {
      // SVG's screen matrix also accounts for viewBox scaling and page scrolling.
      const screenX = matrix.a * x + matrix.c * y + matrix.e;
      const screenY = matrix.b * x + matrix.d * y + matrix.f;
      const sourceX = (screenX - bounds.left + cropX) / scale;
      const sourceY = (screenY - bounds.top + cropY) / scale;
      if (sourceX < 0 || sourceY < 0 || sourceX >= canvas.width || sourceY >= canvas.height) {
        throw new Error("Keep all nine guide squares inside the camera preview.");
      }
      const { data } = ctx.getImageData(Math.floor(sourceX), Math.floor(sourceY), 1, 1);
      samples.push({ r: data[0]!, g: data[1]!, b: data[2]! });
    }
  }
  return samples;
}

/** Live camera preview with a transparent guide for aligning one cube face. */
export function CubeCamera({
  className = "",
  onScan,
  n = 3,
}: {
  n?: number;
  className?: string;
  onScan?: (colours: RGB[]) => void;
}) {
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error("Choose a cube size from 2 to 10.");
  const gridPath =
    "M3 3H297V297H3Z" +
    Array.from({ length: n - 1 }, (_, i) => {
      const line = ((i + 1) * 300) / n;
      return `M${line} 3V297M3 ${line}H297`;
    }).join("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<SVGSVGElement>(null);
  const [scanError, setScanError] = useState("");
  const [samples, setSamples] = useState<RGB[] | null>(null);

  function scanFace(): RGB[] | null {
    setScanError("");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!video || !canvas || !grid) return null;
    let colours: RGB[];
    try {
      colours = captureFaceRGB(video, canvas, grid, n);
    } catch (cause) {
      setSamples(null);
      setScanError(cause instanceof Error ? cause.message : "Could not scan this frame.");
      return null;
    }
    setSamples(colours);
    onScan?.(colours);
    return colours;
  }
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;
    const video = videoRef.current;
    const stop = () => stream?.getTracks().forEach((track) => track.stop());

    async function startCamera() {
      setStatus("loading");
      setError("");
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access requires HTTPS or localhost and a supported browser.");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        // Permission can resolve after unmount or a React Strict Mode cleanup.
        if (cancelled || !video) {
          stop();
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (!cancelled) setStatus("ready");
      } catch (cause) {
        stop();
        if (cancelled) return;
        if (video) video.srcObject = null;
        const name = cause instanceof Error ? cause.name : "";
        setError(
          name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access in your browser settings, then retry."
            : name === "NotFoundError"
              ? "No camera was found. Connect a camera and retry."
              : name === "NotReadableError"
                ? "The camera is unavailable. Close other apps using it, then retry."
                : cause instanceof Error
                  ? cause.message
                  : "Could not start the camera. Please retry.",
        );
        setStatus("error");
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stop();
      if (video && video.srcObject === stream) video.srcObject = null;
    };
  }, [attempt]);

  return (
    <section className={className} aria-label="Cube camera alignment">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <svg
          ref={gridRef}
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-3/5 -translate-x-1/2 -translate-y-1/2"
        >
          {/* A dark outline keeps the white guide visible on light stickers. */}
          <path d={gridPath} stroke="black" strokeOpacity="0.55" strokeWidth="5" />
          <path d={gridPath} stroke="white" strokeOpacity="0.9" strokeWidth="2" />
        </svg>
        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-white">
            <p role={status === "error" ? "alert" : "status"}>
              {status === "error" ? error : "Waiting for camera access…"}
            </p>
            {status === "error" && (
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="rounded-md border border-white px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Retry camera
              </button>
            )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} hidden aria-hidden="true" />
      <button
        type="button"
        disabled={status !== "ready"}
        onClick={scanFace}
        className="mt-4 rounded-md bg-display px-4 py-2 text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        Scan Face
      </button>
      {scanError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {scanError}
        </p>
      )}
      <p role="status" className="mt-2 text-sm text-muted">
        {samples ? `Captured ${samples.length} RGB samples, from top-left to bottom-right.` : ""}
      </p>
      <p className="mt-3 text-sm text-muted">
        Align one face of your cube with the {n * n} squares. The preview stays on your device.
      </p>
    </section>
  );
}
