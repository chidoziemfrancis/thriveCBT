import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg width="100" height="100" viewBox="0 0 32 32" fill="#fff">
          <path d="M16 4h6a6 6 0 010 12h-6V4z" />
          <path d="M16 16h-6a6 6 0 000 12h6V16z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
