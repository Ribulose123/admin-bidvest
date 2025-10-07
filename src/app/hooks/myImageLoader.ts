// myImageLoader.ts
export default function myImageLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string;
  width: number;
  quality?: number;
}): string {
  return `https://example.com/image/upload/f_auto,q_${quality || 'auto'},w_${width}/${src}`;
}