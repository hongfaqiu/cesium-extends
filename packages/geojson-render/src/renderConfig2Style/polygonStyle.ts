import geojsonStatisticQuery from '../geojsonStatisticQuery';
import { DefaultColor } from '../renderConfig';
import {
  section2CustomColor,
  single2paintColor,
  transCustomColorItem,
  value2Custom,
} from './renderTool';

import type { PolygonEntityStyle } from '../renderConfig/entityStyle';
import type { GeoJsonPolygonStyle } from '../renderConfig/typing';

const PolygonConfig2Style = async (data: Record<string, any>[], jsonStyle: GeoJsonPolygonStyle) => {
  const { type, config } = jsonStyle;
  const style: PolygonEntityStyle = {
    type: 'polygon',
    paint: {},
  };
  const opacity = config.opacity;
  const commonPaint: typeof style['paint'] = {
    outline: true,
    outlineColor: single2paintColor(config['outline-color'], opacity),
    outlineWidth: config['outline-width'],
  };

  switch (type) {
    case 'single':
      style.paint = {
        material: single2paintColor(config.color, opacity),
        ...commonPaint,
      };
      return style;

    case 'section':
      const sectionCustom = config.custom ?? (await section2CustomColor(data, config));

      style.paint = {
        ...commonPaint,
      };
      style.custom = {
        material: {
          field: config.field,
          custom: transCustomColorItem(sectionCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
      };
      break;

    case 'value':
      const valueCustom = config.custom ?? (await value2Custom(data, config));

      style.paint = {
        ...commonPaint,
      };
      style.custom = {
        material: {
          field: config.field,
          custom: transCustomColorItem(valueCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
      };
      break;

    case 'height':
      const heightCustom = config.custom ?? (await section2CustomColor(data, config));

      const res = await geojsonStatisticQuery(data, {
        hasMinMax: true,
        columnName: config.field,
        segNum: 0,
      });

      style.paint = {
        ...commonPaint,
      };
      style.custom = {
        material: {
          field: config.field,
          custom: transCustomColorItem(heightCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
        extrudedHeight: {
          field: config.field,
          normalization: {
            valueRange: [res?.min ?? 0, res?.max ?? 0],
            normalRange: config['height-range'],
          },
          default: config['height-range']?.[0] ?? 0,
        },
      };
      break;
  }

  return style;
};

export default PolygonConfig2Style;
