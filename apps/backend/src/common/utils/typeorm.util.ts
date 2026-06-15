import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export interface GroupedFilterDef<T extends ObjectLiteral> {
  key: string;
  value: unknown;
  apply: (qb: SelectQueryBuilder<T>) => void;
}

const baseColumns = [
  'id',
  'createdAt',
  'createdBy',
  'modifiedAt',
  'modifiedBy',
];

const textColumnTypes = new Set([
  'varchar',
  'character varying',
  'nvarchar',
  'nchar',
  'char',
  'text',
  'mediumtext',
  'longtext',
  'string',
]);

export function getAllEntityColumns<T extends ObjectLiteral>(
  repository: Repository<T>,
): (keyof T)[] {
  return repository.metadata.columns
    .map((col) => col.propertyName)
    .filter((col) => !baseColumns.includes(col));
}

export function getTextColumns<T extends ObjectLiteral>(
  repository: Repository<T>,
  includedRelations: string[] = [],
): (keyof T)[] {
  const columns = repository.metadata.columns
    .filter((col) => {
      if (typeof col.type === 'function') {
        return col.type === String;
      }
      if (typeof col.type === 'string') {
        return textColumnTypes.has(col.type.toLowerCase());
      }
      return false;
    })
    .map((col) => col.propertyName)
    .filter((col) => !baseColumns.includes(col));

  const relationColumns: (keyof T)[] = [];
  repository.metadata.relations.forEach((rel) => {
    if (!includedRelations.includes(rel.propertyName)) {
      return;
    }
    const relMetadata = rel.inverseEntityMetadata;
    const relCols = relMetadata.columns
      .filter((col) => {
        if (typeof col.type === 'function') {
          return col.type === String;
        }
        if (typeof col.type === 'string') {
          return textColumnTypes.has(col.type.toLowerCase());
        }
        return false;
      })
      .map((col) => `${rel.propertyName}.${col.propertyName}`)
      .filter((col) => !baseColumns.includes(col.split('.').pop()!));
    relationColumns.push(...relCols);
  });

  const allColumns = [...columns, ...relationColumns];

  return allColumns.length > 0 ? allColumns : getAllEntityColumns(repository);
}

export function applyGroupedFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filterDefs: GroupedFilterDef<T>[],
  groupByFields?: string[],
  isBaseQuery: boolean = false,
) {
  let activeKeys = filterDefs.map((f) => f.key);

  if (isBaseQuery && groupByFields && groupByFields.length > 0) {
    activeKeys = groupByFields.slice(0, -1);
  }

  for (const filter of filterDefs) {
    const hasValue = Array.isArray(filter.value)
      ? filter.value.length > 0
      : !!filter.value;

    if (hasValue && activeKeys.includes(filter.key)) {
      filter.apply(qb);
    }
  }
}
