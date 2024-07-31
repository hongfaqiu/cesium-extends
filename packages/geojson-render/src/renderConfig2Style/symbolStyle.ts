import { Cartesian2 } from "cesium";

import { single2paintColor } from "./renderTool";

import type { LabelEntityStyle } from "../renderConfig/entityStyle";
import type { SymbolStyle } from "../renderConfig/typing";

const symbolConfig2Style = (config: SymbolStyle) => {
  const style: LabelEntityStyle = {
    type: "label",
    paint: {
      text: config["text-field"] ? `{${config["text-field"]}}` : undefined,
      font: `${config["text-size"]}px ${config["text-font"]}`,
      fillColor: single2paintColor(config["text-color"]),
      outlineColor: single2paintColor(config["text-halo-color"]),
      outlineWidth: config["text-halo-width"],
      pixelOffset: new Cartesian2(
        config["text-offsetX"] ?? 0,
        config["text-offsetY"] ?? -10,
      ),
    },
  };
  return style;
};

export default symbolConfig2Style;
