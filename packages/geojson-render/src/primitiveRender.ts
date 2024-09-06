import { Cartesian2, LabelStyle, NearFarScalar } from 'cesium';

import { custom2value } from './renderConfig2Style/renderTool';
import RenderConfig2Style from './renderConfig2Style';

import type { GeoJsonRenderConfig } from './renderConfig/typing';
import type {
  EntityStyle,
  CustomPaintItem,
  CylinderEntityConstructor,
} from './renderConfig/entityStyle';
import type GeoJsonPrimitiveLayer from '@cesium-extends/primitive-geojson';
import type {
  BillboardPrimitiveItem,
  CirclePrimitiveItem,
  PointPrimitiveItem,
  PolylinePrimitiveItem,
  PolygonPrimitiveItem,
} from '@cesium-extends/primitive-geojson';

export const primitiveGeoJsonRender = async (
  primitiveLayer: GeoJsonPrimitiveLayer,
  style: EntityStyle,
) => {
  const featureItems = [...primitiveLayer.featureItems];
  primitiveLayer.removeAllPrimitive();
  const { label, paint, type, custom } = style;
  let depthTest: undefined | boolean = undefined;
  featureItems.map((feature) => {
    const customStyle: any = {};

    for (const k in custom) {
      if (custom[k as keyof typeof custom]) {
        const config = custom[k as keyof typeof custom] as CustomPaintItem;
        config.default =
          config.custom?.find((item) => item.label === 'default')?.value ??
          config.default;
        const featureVal = feature.properties?.[config.field ?? ''];
        const value = custom2value(featureVal, config);
        customStyle[k] = value;
      }
    }

    const height = customStyle?.extrudedHeight;
    const extrudedHeight = height ? height * 1000 : undefined;
    if (depthTest === undefined && height) depthTest = true;

    switch (type) {
      case 'point':
        const image = style.layout?.image ?? customStyle.image;
        if (image) {
          primitiveLayer.addBillboard({
            ...(feature as BillboardPrimitiveItem),
            style: {
              ...style.layout,
              ...customStyle,
              image,
            },
          });
        }
        // 如果不是图标
        if (!style.layout?.image) {
          // 如果是圆柱体
          if (style.cylinder) {
            const { cylinder } = style;
            const cylinderStyle: CylinderEntityConstructor = {
              ...cylinder,
              ...customStyle,
            };
            primitiveLayer.addCircle({
              ...(feature as CirclePrimitiveItem),
              style: {
                color: cylinderStyle.material,
                radius: (cylinderStyle.bottomRadius ?? 1) * 1000,
                extrudedHeight: (cylinderStyle.length ?? 0) * 1000,
              },
            });
          } else {
            // 如果是点
            primitiveLayer.addPoint({
              ...(feature as PointPrimitiveItem),
              style: {
                ...paint,
                ...customStyle,
              },
            });
          }
        }
        break;
      case 'line':
        primitiveLayer.addPolyline({
          ...(feature as PolylinePrimitiveItem),
          style: {
            ...paint,
            ...customStyle,
            extrudedHeight,
          },
        });
        break;
      case 'polygon':
        primitiveLayer.addPolygon({
          ...(feature as PolygonPrimitiveItem),
          style: {
            ...paint,
            ...customStyle,
            extrudedHeight,
          },
        });
        break;
      case 'mix':
        if (feature.type === 'Point' || feature.type === 'Billboard') {
          if (paint.markerSymbol) {
            primitiveLayer.addBillboard({
              ...(feature as BillboardPrimitiveItem),
              style: {
                image: paint.markerSymbol,
                color: paint.markerColor,
                scale: (paint.markerSize ?? 5) / 5,
              },
            });
          } else {
            primitiveLayer.addPoint({
              ...(feature as PointPrimitiveItem),
              style: {
                color: paint.markerColor,
                outlineColor: paint.stroke,
                outlineWidth: paint.strokeWidth,
                pixelSize: paint.markerSize,
              },
            });
          }
        }
        if (feature.type === 'Polygon') {
          primitiveLayer.addPolygon({
            ...feature,
            style: {
              material: paint.fill,
              outlineColor: paint.stroke,
              outlineWidth: paint.strokeWidth,
            },
          });
        }
        if (feature.type === 'Polyline') {
          primitiveLayer.addPolyline({
            ...feature,
            style: {
              material: paint.fill,
              width: paint.strokeWidth,
            },
          });
        }
        break;
    }
    if (label?.paint.text && feature.center) {
      primitiveLayer.addLabel({
        type: 'Label',
        position: feature.center.cartesian3,
        style: {
          font: `bold 20px Arial`,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(0, -10),
          scale: 1,
          scaleByDistance: new NearFarScalar(1, 0.85, 8.0e6, 0.75),
          ...label.paint,
          text: label.paint.text?.replace(
            /{([^{}]*)}/g,
            (match, p1) => feature.properties?.[p1] ?? '',
          ),
        },
      });
    }
  });
  primitiveLayer.reloadPrimitive(depthTest);
};

export const renderPrimitiveGeoJson = async (
  primitiveLayer: GeoJsonPrimitiveLayer,
  config: GeoJsonRenderConfig,
) => {
  const { type, style } = config;
  if (!type || !style) return;

  const data = primitiveLayer.featureItems
    .map((feature) => feature.properties)
    .filter((item) => item !== undefined);
  const entityStyle: EntityStyle = await RenderConfig2Style[type](
    data as any,
    style as any,
  );
  entityStyle.label = style.symbol
    ? RenderConfig2Style.symbol(style.symbol)
    : undefined;
  if (entityStyle) await primitiveGeoJsonRender(primitiveLayer, entityStyle);
  return entityStyle;
};
