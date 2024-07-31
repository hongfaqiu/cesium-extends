import { afterEach, describe, expect, it } from "vitest";
import GeoJsonPrimitiveLayer from "../src";
import { Cartesian3, Color } from "cesium";
import {
  BillboardPrimitiveItem,
  CirclePrimitiveItem,
  LabelPrimitiveItem,
  PolygonPrimitiveItem,
  PolylinePrimitiveItem,
} from "../src/typings";

describe("GeoJsonPrimitiveLayer", () => {
  const layer = new GeoJsonPrimitiveLayer();

  afterEach(() => {
    layer.removeAllPrimitive();
  });
  it("should add a billboard", () => {
    const billboard: BillboardPrimitiveItem = {
      type: "Billboard",
      position: new Cartesian3(0, 0, 0),
      style: {
        image: "path/to/image.png",
        scale: 2,
      },
    };
    const instance = layer.addBillboard(billboard);
    expect(layer.billboardCollection.contains(instance)).toBe(true);
  });

  it("should add a label", () => {
    const label: LabelPrimitiveItem = {
      type: "Label",
      position: new Cartesian3(0, 0, 0),
      style: {
        font: "24px sans-serif",
        fillColor: Color.TRANSPARENT,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      },
    };
    const instance = layer.addLabel(label);
    expect(layer.labelCollection.contains(instance)).toBe(true);
  });

  it("should add a circle", () => {
    const circle: CirclePrimitiveItem = {
      type: "Circle",
      position: new Cartesian3(0, 0, 0),
      style: {
        color: Color.WHITE,
        radius: 1000,
      },
    };
    const instance = layer.addCircle(circle);
    expect(layer.getFeatureItemById(instance.id)).not.toBeNull();
  });

  it("should add a polygon", () => {
    const polygon: PolygonPrimitiveItem = {
      type: "Polygon",
      positions: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
        [0, 0, 0],
      ].map((pos) => Cartesian3.fromArray(pos)),
      style: {
        material: Color.WHITE,
      },
    };
    const instance = layer.addPolygon(polygon);
    expect(layer.getFeatureItemById(instance.id)).not.toBeNull();
  });

  it("should add a Polyline", () => {
    const polyline: PolylinePrimitiveItem = {
      type: "Polyline",
      positions: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
        [0, 0, 0],
      ].map((pos) => Cartesian3.fromArray(pos)),
      style: {
        material: Color.WHITE,
      },
    };
    const instance = layer.addPolyline(polyline);
    expect(layer.getFeatureItemById(instance.id)).not.toBeNull();
  });

  it("should add a feature", async () => {
    const feature: GeoJSON.GeoJSON = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {},
    };

    await layer.load(feature);
    expect(layer.featureItems.length).to.equal(1);
  });
});
