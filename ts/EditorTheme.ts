import {
  BackgroundProperty,
  ColorProperty,
  WidthProperty,
  HeightProperty,
  BoxShadowProperty,
} from 'csstype';

/**
 * Theme for the editor as a whole
 */
export interface EditorTheme {
  background?: BackgroundProperty<string>;
  color?: ColorProperty;
  width?: WidthProperty<string>;
  height?: HeightProperty<string>;
  'box-shadow'?: BoxShadowProperty;
}
