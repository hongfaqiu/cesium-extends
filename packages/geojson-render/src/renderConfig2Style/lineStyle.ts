import { DefaultColor } from "../renderConfig";
import {
  section2CustomColor,
  single2paintColor,
  transCustomColorItem,
  value2Custom,
} from "./renderTool";

import type { PolylineEntityStyle } from "../renderConfig/entityStyle";
import type { GeoJsonLineStyle } from "../renderConfig/typing";

const LineConfig2Style = async (
  data: Record<string, any>[],
  jsonStyle: GeoJsonLineStyle,
) => {
  const { type, config } = jsonStyle;
  const style: PolylineEntityStyle = {
    type: "line",
    paint: {},
  };
  const opacity = config.opacity;
  const commonPaint: (typeof style)["paint"] = {
    width: config["line-width"],
  };

  switch (type) {
    case "single":
      style.paint = {
        material: single2paintColor(config.color, opacity),
        ...commonPaint,
      };
      return style;

    case "section":
      const sectionCustom =
        config.custom ?? (await section2CustomColor(data, config));

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

    case "value":
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
  }

  return style;
};

export default LineConfig2Style;
