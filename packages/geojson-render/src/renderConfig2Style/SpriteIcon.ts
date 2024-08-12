import { SpriteConfig, SpriteJson, getSpriteJson } from "./sprite";

export type SpriteIconOptions = {
  url: string;
  params?: Record<string, any> | undefined;
};

export type SpriteOptins = {
  spriteImage: HTMLImageElement;
  json: SpriteJson;
};

const optionsCache: Record<string, SpriteOptins> = {};

export function loadImage(url: string, params?: Record<string, any>) {
  let png = url;
  if (params) {
    const entries = Object.entries(params);
    png = url + "?";
    for (let i = 0; i < entries.length; i += 1) {
      if (i > 0) png += "&";
      png += entries[i][0] + "=" + entries[i][1];
    }
  }
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = png;
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      resolve(img);
    };
  });
}

export const image2canvas = (
  image: CanvasImageSource,
  config?: SpriteConfig,
  color?: string,
) => {
  if (!config || !image) return undefined;

  const newCanvas = document.createElement("canvas");
  newCanvas.height = config.height;
  newCanvas.width = config.width;
  const context = newCanvas.getContext("2d");
  context?.drawImage(
    image,
    config.x,
    config.y,
    config.width,
    config.height,
    0,
    0,
    config.width,
    config.height,
  );

  if (color && context) {
    context.globalCompositeOperation = "source-in";
    context.fillStyle = color;
    context.fillRect(0, 0, config.width, config.height);
  }

  return newCanvas;
};

export const reColorCanvas = (
  image: HTMLCanvasElement,
  color?: string,
) => {
  if (!image) return undefined;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = image.width;
  newCanvas.height = image.height;
  const context = newCanvas.getContext('2d');
  
  if (context) {
    context.drawImage(image, 0, 0);
    
    if (color) {
      context.globalCompositeOperation = 'source-in';
      context.fillStyle = color;
      context.fillRect(0, 0, image.width, image.height);
    }
  }
  return newCanvas;
};

export default class SpriteIcon {
  private _options: SpriteOptins | undefined;
  private _ready: boolean;
  readyPromise: Promise<SpriteOptins | undefined>;
  private _cache: Record<string, HTMLCanvasElement | undefined>;

  constructor(sprite: SpriteIconOptions) {
    this._ready = false;
    this.readyPromise = this.loadSprite(sprite).then((res) => {
      this._ready = true;
      return res;
    });
    this._cache = {};
  }

  get ready() {
    return this._ready;
  }

  get options() {
    return this._options;
  }

  async loadSprite(sprite: SpriteIconOptions) {
    if (!sprite) return undefined;

    const key = sprite.url + sprite.params;
    let options: SpriteOptins;
    if (optionsCache[key]) options = optionsCache[key];
    else {
      options = {
        spriteImage: await loadImage(
          sprite.url.replace(/(.*)\.(.*)/, "$1.png"),
          sprite.params,
        ),
        json: await getSpriteJson(
          sprite.url.replace(/(.*)\.(.*)/, "$1.json"),
          sprite.params,
        ),
      };
      optionsCache[key] = options;
    }
    this._options = options;
    return this._options;
  }

  getImageByName(name: string | undefined, color = "white") {
    if (!name || !this._options?.spriteImage) {
      return undefined;
    }
    const key = name + color;
    if (this._cache[key]) return this._cache[key];
    else {
      const image = image2canvas(
        this._options.spriteImage,
        this._options.json[name],
        color,
      );
      this._cache[key] = image;
      return image;
    }
  }
}
