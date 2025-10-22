export interface CustomItem {
  id: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}
