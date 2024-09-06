import lineConfig2Syle from './lineStyle';
import MixConfig2Style from './mixStyle';
import pointConfig2Syle from './pointStyle';
import polygonConfig2Style from './polygonStyle';
import symbolConfig2Style from './symbolStyle';

const RenderConfig2Style = {
  polygon: polygonConfig2Style,
  line: lineConfig2Syle,
  point: pointConfig2Syle,
  symbol: symbolConfig2Style,
  mix: MixConfig2Style,
};

export default RenderConfig2Style;
