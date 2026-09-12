import type { DeviceFolder } from '../types/board';

export const DEFAULT_FOLDERS: DeviceFolder[] = [
  { id: 'all', name: 'Todas as Placas', brand: 'Todas' },
  { id: 'samsung', name: 'Samsung Galaxy', brand: 'Samsung' },
  { id: 'motorola', name: 'Motorola Moto', brand: 'Motorola' },
  { id: 'xiaomi', name: 'Xiaomi / Redmi / Poco', brand: 'Xiaomi' },
  { id: 'apple', name: 'Apple iPhone', brand: 'Apple' },
  { id: 'modules', name: 'Módulos de Carga & BMS', brand: 'Módulos Avulsos' },
  { id: 'converters', name: 'Conversores DC-DC', brand: 'Fontes & Conversores' },
];
