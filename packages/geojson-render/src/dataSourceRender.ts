import {
  ArcType,
  BillboardGraphics,
  Cartesian2,
  Color,
  ConstantPositionProperty,
  ConstantProperty,
  CylinderGraphics,
  HeightReference,
  JulianDate,
  LabelGraphics,
  LabelStyle,
  NearFarScalar,
  PointGraphics,
  PolygonGraphics,
  PolylineGraphics,
  VerticalOrigin,
} from 'cesium';

import RenderConfig2Style from './renderConfig2Style';
import BillBuilder from './BillBuilder';
import { custom2value, getEntityValue } from './renderConfig2Style/renderTool';

import type {
  DataSource,
  Entity,
  Billboard,
  Label,
  PointPrimitive,
} from 'cesium';
import type { GeoJsonRenderConfig } from './renderConfig/typing';
import type { EntityStyle, CustomPaintItem } from './renderConfig/entityStyle';
import { getPositionsCenter } from '@cesium-extends/primitive-geojson';

export const dataSourceRender = async (
  dataSource: DataSource,
  style: EntityStyle,
) => {
  const entities = dataSource.entities.values;
  const { label, paint, type, custom } = style;

  entities.map((entity) => {
    const customStyle: Record<string, any> = {};

    for (const k in custom) {
      if (custom[k as keyof typeof custom]) {
        const config = custom[k as keyof typeof custom] as CustomPaintItem;
        config.default =
          config.custom?.find((item) => item.label === 'default')?.value ??
          config.default;
        const entityVal = getEntityValue(entity, config.field);
        const value = custom2value(entityVal, config);
        customStyle[k] = value;
      }
    }

    switch (type) {
      case 'point':
        entity.point = undefined;
        entity.billboard = undefined;
        entity.cylinder = undefined;

        const image = style.layout?.image ?? customStyle.image;
        if (image) {
          const billboardStyle = {
            ...style.layout,
            ...customStyle,
            image,
          };
          if (billboardStyle.image) {
            entity.billboard = new BillboardGraphics(billboardStyle);
          }
        } else {
          // 如果是圆柱体
          if (style.cylinder) {
            const { cylinder } = style;
            const length = (customStyle?.length ?? 1) * 1000;
            entity.cylinder = new CylinderGraphics({
              ...cylinder,
              ...customStyle,
              length,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              topRadius: (cylinder?.topRadius ?? 1) * 1000,
              bottomRadius: (cylinder?.bottomRadius ?? 1) * 1000,
            });
          } else {
            // 如果是点
            entity.point = new PointGraphics({
              ...paint,
              ...customStyle,
            });
          }
        }
        break;
      case 'line':
        entity.polygon = undefined;
        entity.polyline = new PolylineGraphics({
          positions: entity.polyline?.positions,
          ...paint,
          ...customStyle,
          clampToGround: true,
          arcType: ArcType.RHUMB,
        });
        break;
      case 'polygon':
        const height = customStyle?.extrudedHeight;
        entity.polygon = new PolygonGraphics({
          hierarchy: entity.polygon?.hierarchy,
          ...paint,
          ...customStyle,
          extrudedHeight: height ? height * 1000 : undefined,
          arcType: ArcType.RHUMB,
        });
        entity.polyline = new PolylineGraphics({
          positions: (entity.polygon.hierarchy as any)?._value.positions,
          width: paint.outlineWidth,
          material: paint.outlineColor,
          clampToGround: true,
          arcType: ArcType.RHUMB,
        });
        break;
      case 'mix':
        if (entity.billboard) {
          if (paint.markerSymbol) {
            entity.point = undefined;
            entity.billboard.show = new ConstantProperty(true);
            entity.billboard = new BillboardGraphics({
              image: paint.markerSymbol,
              color: paint.markerColor,
              scale: (paint.markerSize ?? 5) / 5,
            });
          } else {
            entity.billboard.show = new ConstantProperty(false);
            entity.point = new PointGraphics({
              color: paint.markerColor,
              outlineColor: paint.stroke,
              outlineWidth: paint.strokeWidth,
              pixelSize: paint.markerSize,
            });
          }
        }
        entity.polyline = new PolylineGraphics({
          positions: entity.polyline?.positions,
          material: paint.fill,
          width: paint.strokeWidth,
          clampToGround: true,
          arcType: ArcType.RHUMB,
        });

        if (entity.polygon) {
          entity.polygon = new PolygonGraphics({
            hierarchy: entity.polygon?.hierarchy,
            material: paint.fill,
            arcType: ArcType.RHUMB,
          });
          entity.polyline = new PolylineGraphics({
            positions: (entity.polygon.hierarchy as any)?._value.positions,
            width: paint.strokeWidth,
            material: paint.stroke,
            clampToGround: true,
            arcType: ArcType.RHUMB,
          });
        }

        break;
    }
    if (label?.paint.text) {
      entity.label = new LabelGraphics({
        font: `bold 20px Arial`,
        outlineWidth: 4,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cartesian2(0, -10),
        scale: 1,
        scaleByDistance: new NearFarScalar(1, 0.85, 8.0e6, 0.75),
        ...label.paint,
        text: label.paint.text?.replace(
          /\{([^\{]*)\}/g,
          (match, p1) => getEntityValue(entity, p1) ?? '',
        ),
      });
    } else entity.label = undefined;
  });

  if (style.type === 'point') {
    dataSourceCluster(dataSource, style.cluster);
  }
};

export const renderGeoJson = async (
  dataSource: DataSource,
  config: GeoJsonRenderConfig,
) => {
  const { type, style } = config;
  if (!type || !style) return undefined;

  const data = dataSource.entities.values.map((item) =>
    item.properties?.getValue(JulianDate.now()),
  );
  const entityStyle: EntityStyle = await RenderConfig2Style[type](
    data,
    style as any,
  );
  entityStyle.label = style.symbol
    ? RenderConfig2Style.symbol(style.symbol)
    : undefined;
  if (entityStyle) await dataSourceRender(dataSource, entityStyle);
  return entityStyle;
};

const clusterEvent = (
  clusteredEntities: Entity[],
  cluster: {
    billboard: Billboard;
    label: Label;
    point: PointPrimitive;
  },
  options: {
    alpha?: number;
    scale?: number;
    colorBar?: string[];
    maxNum?: number;
  } = {},
) => {
  const {
    alpha = 1,
    scale = 1,
    colorBar = [
      '#313695',
      '#4575b4',
      '#74add1',
      '#abd9e9',
      '#e0f3f8',
      '#ffffbf',
      '#fee090',
      '#fdae61',
      '#f46d43',
      '#d73027',
      '#a50026',
    ],
    maxNum = 1000,
  } = options;

  cluster.billboard.show = true;
  cluster.label.show = false;
  cluster.billboard.id = cluster.label.id;
  cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;
  const length = clusteredEntities.length;
  const numSize = length.toString().length;
  const helpNum = Math.pow(10, numSize - 1);
  if (length <= maxNum) {
    const num = numSize > 1 ? ~~(length / helpNum) * helpNum : length;
    cluster.billboard.image = new BillBuilder()
      .fromText(
        num >= 10 ? `${num}+` : String(length),
        Color.fromCssColorString(
          colorBar[Math.floor((length / maxNum) * colorBar.length)] ??
            colorBar[colorBar.length - 1],
        ),
        80 + (length / maxNum) * 100,
      )
      .toDataURL();
  } else {
    cluster.billboard.image = new BillBuilder()
      .fromText(
        `${length}`,
        Color.fromCssColorString(colorBar[colorBar.length - 1]),
        180,
      )
      .toDataURL();
  }

  cluster.billboard.color.alpha = alpha;
  cluster.billboard.scale = scale;
};

function dataSourceCluster(
  dataSource: DataSource,
  options: {
    enable?: boolean;
    pixelRange?: number;
    minimumClusterSize?: number;
    colors?: string[];
    alpha?: number;
    scale?: number;
    maxNum?: number;
  } = {},
) {
  const { enable = false, pixelRange = 80, minimumClusterSize = 2 } = options;

  dataSource.clustering.enabled = enable;
  dataSource.clustering.pixelRange = pixelRange;
  dataSource.clustering.minimumClusterSize = minimumClusterSize;

  dataSource.clustering.clusterEvent.removeEventListener(clusterEvent);
  if (enable)
    dataSource.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) =>
        clusterEvent(clusteredEntities, cluster, options),
    );
}

function updateEntityPosition(entity: Entity) {
  if (entity.polygon) {
    const center = getPositionsCenter(
      entity.polygon?.hierarchy?.getValue(JulianDate.now()).positions,
    ).cartesian3;
    entity.position = new ConstantPositionProperty(center);
    return;
  }
  if (entity.polyline) {
    const positions = entity.polyline.positions?.getValue(JulianDate.now());
    const center = positions[Math.floor(positions.length / 2)];
    entity.position = new ConstantPositionProperty(center);
    return;
  }
}

export function updateDataSourcePosition(dataSource: DataSource) {
  const entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i += 1) {
    const entity = entities[i];
    updateEntityPosition(entity);
  }
}
