import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      >
        <svg width="280" height="280" viewBox="0 0 32 32" fill="#fff">
          <path d="M16 4h6a6 6 0 010 12h-6V4z" />
          <path d="M16 16h-6a6 6 0 000 12h6V16z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
