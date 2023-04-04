import { Resource } from "cesium";

export type SpriteConfig = {
  height: number;
  pixelRatio: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};
export type SpriteJson = Record<string, SpriteConfig>;
/**
 * 获取精灵图json
 */
export const getSpriteJson = (url: string, params: Record<string, string> = {}): Promise<SpriteJson> => {
  return Resource.fetchJson({
    url,
    queryParameters: params,
  })
};
