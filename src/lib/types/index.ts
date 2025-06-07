export interface s3Obj {
  key: string | undefined;
  url: string;
  filename: string | undefined;
  size: number | undefined;
  lastModified: Date | undefined;
}