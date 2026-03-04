export interface CombinedStudent {
  name: string;
  email?: string;
  source: 'internal' | 'external';
}
