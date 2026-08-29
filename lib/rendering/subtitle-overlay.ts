import sharp from "sharp";

export interface SubtitleOverlayOptions {
  width?: number;
  height?: number;
  actNumber?: number;
  actTitle: string;
  subtitle?: string;
  outputPath: string;
}

export class SubtitleOverlayService {
  static readonly DEFAULT_WIDTH = 1920;
  static readonly DEFAULT_HEIGHT = 804;

  /**
   * Generates a high-resolution 1920x804 transparent PNG graphic with Act Title card and journal subtitles.
   */
  static async createSceneOverlay(options: SubtitleOverlayOptions): Promise<string> {
    const width = options.width || this.DEFAULT_WIDTH;
    const height = options.height || this.DEFAULT_HEIGHT;
    const actNumber = options.actNumber || 1;
    const actTitle = this.escapeXml(options.actTitle.toUpperCase());
    const subtitle = options.subtitle ? this.escapeXml(options.subtitle) : "";

    // Build elegant SVG graphic overlay
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Drop shadow filter -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.9" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Top Act Tag -->
      <g filter="url(#shadow)">
        <rect x="80" y="50" width="180" height="28" rx="3" fill="#C85A28" fill-opacity="0.85" />
        <text x="170" y="69" 
              font-family="Georgia, 'Times New Roman', serif" 
              font-size="13" 
              font-weight="bold" 
              letter-spacing="2" 
              fill="#FFFFFF" 
              text-anchor="middle">ACT 0${actNumber}</text>

        <!-- Act Title -->
        <text x="275" y="70" 
              font-family="Georgia, 'Times New Roman', serif" 
              font-size="18" 
              font-weight="bold" 
              letter-spacing="3" 
              fill="#FAF8F5" 
              text-anchor="start">${actTitle}</text>
      </g>

      <!-- Bottom Subtitle / Journal Beat -->
      ${
        subtitle
          ? `
      <g filter="url(#shadow)">
        <!-- Subtle dark gradient backing for subtitle readability -->
        <rect x="${width / 2 - 500}" y="${height - 130}" width="1000" height="70" rx="6" fill="#000000" fill-opacity="0.45" />
        <text x="${width / 2}" y="${height - 86}" 
              font-family="Georgia, 'Times New Roman', serif" 
              font-style="italic" 
              font-size="24" 
              letter-spacing="0.5" 
              fill="#FAF8F5" 
              text-anchor="middle">“${subtitle}”</text>
      </g>
      `
          : ""
      }
    </svg>`;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(options.outputPath);

    return options.outputPath;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }
}
