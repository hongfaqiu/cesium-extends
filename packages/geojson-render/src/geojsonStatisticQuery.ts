export type StatisticParams = {
  columnName?: string;
  segNum?: number;
  hasSet?: boolean;
  hasMinMax?: boolean;
  maxLen?: number;
};

export type StatisticResult = {
  total: number;
  sections: number[]; // 自然分段结果
  values: (number | string)[]; // 值
  min: number;
  max: number;
};
/**
 * 获取对象数组的统计信息
 */
export default async function geojsonStatisticQuery(
  data: Record<string, any>[],
  params: StatisticParams,
) {
  const { columnName, segNum, maxLen } = params;
  if (!columnName) return null;
  const total = data.length;
  const values = data.map((item) => item[columnName]);
  const numValues = values
    .filter((item) => typeof item === 'number')
    .sort((a, b) => a - b);
  const numCount = numValues.length;
  const result: StatisticResult = {
    total,
    sections: [],
    values: [],
    min: numValues[0],
    max: numValues[numCount - 1],
  };
  if (maxLen !== undefined) {
    for (let i = 0; i < total; i += 1) {
      const val = values[i];
      if (result.values.length === maxLen) break;
      if (!result.values.includes(val)) {
        result.values.push(val);
      }
    }
  }
  if (segNum) {
    const step = numCount / segNum;
    for (let j = 0; j <= numCount; j += step) {
      const val = numValues[Math.floor(j)];
      result.sections.push(val);
    }
    // 保证最大值
    result.sections[segNum] = result.max;
  }
  return result;
}
