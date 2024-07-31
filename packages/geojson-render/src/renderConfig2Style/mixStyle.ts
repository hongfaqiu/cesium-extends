import { getSpriteJson } from "./pbf";
import { image2canvas, loadImage, single2paintColor } from "./renderTool";

import type { MixEntityStyle } from "../renderConfig/entityStyle";
import type { GeoJsonMixStyle } from "../renderConfig/typing";

const MixConfig2Style = async (
  data: Record<string, any>[],
  jsonStyle: GeoJsonMixStyle,
) => {
  const { config, sprite } = jsonStyle;
  const spriteOption = !sprite
    ? undefined
    : {
        spriteImage: await loadImage(sprite.url + ".png", sprite.params),
        json: await getSpriteJson(sprite.url + ".json", sprite.params),
      };
  const imageName = config.markerSymbol;
  const image =
    spriteOption && imageName
      ? image2canvas(
          spriteOption.spriteImage,
          spriteOption.json[imageName],
        )?.toDataURL()
      : undefined;

  const style: MixEntityStyle = {
    type: "mix",
    paint: {
      ...config,
      fill: single2paintColor(config.fill),
      markerColor: single2paintColor(config.markerColor),
      markerSymbol: config["label-type"] === "icon" ? image : undefined,
      stroke: single2paintColor(config.stroke),
      clampToGround: true,
    },
  };

  return style;
};

export default MixConfig2Style;
