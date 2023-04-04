import { getSpriteJson } from "./pbf";
import { image2canvas, loadImage } from "./renderTool";

import type { SpriteJson } from "./pbf";

export type SpriteIconOptions = {
  url: string;
  params?: Record<string, any> | undefined;
}

export type SpriteOptins = {
  spriteImage: HTMLImageElement;
  json: SpriteJson;
}

const optionsCache: Record<string, SpriteOptins> = {}

export default class SpriteIcon {
  private _options: SpriteOptins | undefined;
  private _ready: boolean;
  readyPromise: Promise<SpriteOptins | undefined>;
  private _cache: Record<string, string | undefined>;

  constructor(sprite: SpriteIconOptions) {
    this._ready = false
    this.readyPromise = this.loadSprite(sprite).then(res => {
      this._ready = true
      return res
    })
    this._cache = {}
  }

  get ready() {
    return this._ready
  }

  get options() {
    return this._options
  }

  async loadSprite(sprite: SpriteIconOptions) {
    if (!sprite) return undefined

    const key = sprite.url + sprite.params
    let options: SpriteOptins
    if (optionsCache[key]) options = optionsCache[key]
    else {
      options = {
        spriteImage: await loadImage(sprite.url.replace(/(.*)\/sprite/, "$1/sprite.png"), sprite.params),
        json: await getSpriteJson(sprite.url.replace(/(.*)\/sprite/, "$1/sprite.json"), sprite.params),
      }
      optionsCache[key] = options
    }
    this._options = options
    return this._options
  }

  getImageByName(name: string | undefined, color = 'white') {
    if (!name || !this._options?.spriteImage) {
      return undefined
    }
    const key = name + color
    if (this._cache[key]) return this._cache[key]
    else {
      const image = image2canvas(this._options.spriteImage, this._options.json[name])?.toDataURL()
      this._cache[key] = image
      return image
    }
  }

}

