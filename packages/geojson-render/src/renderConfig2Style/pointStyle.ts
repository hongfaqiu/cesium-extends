import { DefaultColor } from '../renderConfig';
import geojsonStatisticQuery from '../geojsonStatisticQuery';
import {
  section2CustomColor,
  section2CustomSize,
  single2paintColor,
  transCustomColorItem,
  value2Custom,
} from './renderTool';
import SpriteIcon from './SpriteIcon';

import type {
  CustomPaintItem,
  PointEntityStyle,
} from '../renderConfig/entityStyle';
import type {
  GeoJsonCommonStyle,
  GeoJsonPointStyle,
} from '../renderConfig/typing';

const PointConfig2Style = async (
  data: Record<string, any>[],
  jsonStyle: GeoJsonPointStyle & GeoJsonCommonStyle,
) => {
  const { type, config } = jsonStyle;
  const style: PointEntityStyle = {
    type: 'point',
    cluster: type === 'height' ? undefined : jsonStyle.cluster,
  };
  const opacity = config.opacity;
  const commonPaint: (typeof style)['paint'] = {
    outlineWidth: config['circle-stroke-width'],
    outlineColor: single2paintColor(config['circle-stroke-color'], opacity),
  };

  let SpriteIcons: SpriteIcon | undefined;

  if (jsonStyle.sprite) {
    SpriteIcons = new SpriteIcon(jsonStyle.sprite);
    await SpriteIcons.readyPromise;
  }

  const ImageCustom = config.custom?.map((item) => ({
    label: item.label,
    value: SpriteIcons?.getImageByName(item.image),
  }));

  const labelSize = (config as any)['label-size'];
  const imageSize = labelSize + (config['circle-stroke-width'] ?? 0) * 2;
  let image: HTMLCanvasElement | undefined = undefined;
  if ((config as any)['label-type'] === 'icon') {
    const imageName = (config as any)['icon-image'];
    image = SpriteIcons?.getImageByName(imageName);
  }

  switch (type) {
    case 'single':
      if (config['label-type'] === 'icon') {
        const imageName = config['icon-image'];
        const image = SpriteIcons?.getImageByName(imageName);
        style.layout = {
          image,
          color: single2paintColor(config.color, opacity),
          width: imageSize,
          height: imageSize,
        };
      } else {
        style.paint = {
          color: single2paintColor(config.color, opacity),
          pixelSize: labelSize,
          ...commonPaint,
        };
      }
      break;

    case 'section':
      const sectionCustom =
        config.custom ?? (await section2CustomColor(data, config));
      style.paint = {
        pixelSize: labelSize,
        ...commonPaint,
      };

      style.layout = {
        image,
        width: imageSize,
        height: imageSize,
      };

      style.custom = {
        color: {
          field: config.field,
          custom: transCustomColorItem(sectionCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
        image: {
          field: config.field,
          custom: ImageCustom,
        },
      };
      break;

    case 'value':
      const valueCustom = config.custom ?? (await value2Custom(data, config));

      style.paint = {
        pixelSize: labelSize,
        ...commonPaint,
      };

      style.layout = {
        image,
        width: imageSize,
        height: imageSize,
      };

      style.custom = {
        color: {
          field: config.field,
          custom: transCustomColorItem(valueCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
        image: {
          field: config.field,
          custom: ImageCustom,
        },
      };
      break;

    case 'bubble':
      const sectionType = config['section-type'];

      const bubbleColorCustom =
        config.custom ??
        (await section2CustomColor(data, {
          field: config.field,
          color: config.colors,
          'section-type': sectionType,
        }));
      const colorType = config['fill-type'];
      const strokeSize = config['circle-stroke-width'] ?? 0;
      const color = single2paintColor(config.color, opacity);

      style.paint = {
        ...commonPaint,
        color,
      };

      const sizeCustom = await section2CustomSize(data, {
        field: config.field,
        num: config['section-num'],
        'section-type': sectionType,
        sizeRange: labelSize,
      });

      const sizeCustomOptions: CustomPaintItem<number | undefined> = {
        field: config.field,
        custom: sizeCustom.map((item) => ({
          ...item,
          value: item.value + strokeSize * 2,
        })),
      };
      const pixelSizeOptions: CustomPaintItem<number | undefined> = {
        field: config.field,
        custom: sizeCustom,
        default: labelSize?.[0] ?? 5,
      };

      if (sectionType === 'auto') {
        const valueRange = [sizeCustom[0].label, sizeCustom[1].label] as [
          number,
          number,
        ];

        sizeCustomOptions.normalization = {
          valueRange,
          normalRange: labelSize.map((size: number) => size + strokeSize * 2),
        };
        pixelSizeOptions.normalization = {
          valueRange,
          normalRange: labelSize,
        };
      }

      style.layout = {
        image,
        color,
        width: imageSize,
        height: imageSize,
      };

      style.custom = {
        color:
          colorType === 'multi' && sectionType !== 'auto'
            ? {
                field: config.field,
                custom: transCustomColorItem(bubbleColorCustom, opacity),
                default: single2paintColor(DefaultColor, opacity),
              }
            : undefined,
        image:
          colorType === 'multi'
            ? {
                field: config.field,
                custom: ImageCustom,
              }
            : undefined,
        pixelSize: pixelSizeOptions,
        height: sizeCustomOptions,
        width: sizeCustomOptions,
      };

      break;

    case 'height':
      const heightCustom =
        config.custom ?? (await section2CustomColor(data, config));

      const res = await geojsonStatisticQuery(data, {
        hasMinMax: true,
        columnName: config.field,
        segNum: 0,
      });

      style.cylinder = {
        topRadius: config['radius-size'],
        bottomRadius: config['radius-size'],
      };
      style.custom = {
        material: {
          field: config.field,
          custom: transCustomColorItem(heightCustom, opacity),
          default: single2paintColor(DefaultColor, opacity),
        },
        length: {
          field: config.field,
          normalization: {
            valueRange: [res?.min ?? 0, res?.max ?? 0],
            normalRange: config['height-range'],
          },
          default: 100,
        },
      };
      break;
  }
  return style;
};

export default PointConfig2Style;
