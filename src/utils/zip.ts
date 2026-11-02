/**
 * Zero-dependency client-side PKZIP generator using standard Uint8Array.
 * Allows creating genuine .zip archives in the browser for audit packs and exports.
 */

interface ZipEntry {
  filename: string;
  content: string | Uint8Array;
}

export function createZipArchive(files: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    filenameBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;
  const parts: Uint8Array[] = [];

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // 1. Write Local File Headers + Data
  for (const file of files) {
    const filenameBytes = encoder.encode(file.filename);
    const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const crc = computeCrc32(contentBytes);
    const size = contentBytes.length;

    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method (0 = stored / uncompressed)
    view.setUint16(10, 0, true);         // Last mod file time
    view.setUint16(12, 0, true);         // Last mod file date
    view.setUint32(14, crc, true);       // CRC-32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length

    localHeader.set(filenameBytes, 30);

    fileRecords.push({
      filenameBytes,
      contentBytes,
      crc,
      offset: currentOffset,
    });

    parts.push(localHeader);
    parts.push(contentBytes);
    currentOffset += localHeader.length + contentBytes.length;
  }

  // 2. Write Central Directory
  const centralDirStart = currentOffset;
  let centralDirSize = 0;

  for (const rec of fileRecords) {
    const cdHeader = new Uint8Array(46 + rec.filenameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central file header signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed to extract
    view.setUint16(8, 0, true);          // General purpose bit flag
    view.setUint16(10, 0, true);         // Compression method (0 = uncompressed)
    view.setUint16(12, 0, true);         // Last mod file time
    view.setUint16(14, 0, true);         // Last mod file date
    view.setUint32(16, rec.crc, true);   // CRC-32
    view.setUint32(20, rec.contentBytes.length, true); // Compressed size
    view.setUint32(24, rec.contentBytes.length, true); // Uncompressed size
    view.setUint16(28, rec.filenameBytes.length, true); // Filename length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, rec.offset, true);// Relative offset of local header

    cdHeader.set(rec.filenameBytes, 46);
    parts.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // 3. End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Number of this disk
  eocdView.setUint16(6, 0, true);          // Disk with central directory
  eocdView.setUint16(8, fileRecords.length, true);  // Entries on this disk
  eocdView.setUint16(10, fileRecords.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, centralDirStart, true);    // Offset of central directory
  eocdView.setUint16(20, 0, true);         // Comment length

  parts.push(eocd);

  return new Blob(parts as any, { type: 'application/zip' });
}

export function downloadZip(files: ZipEntry[], zipFilename: string) {
  const blob = createZipArchive(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
