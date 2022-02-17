// PATCH for TS and the Theme to add custom colors

import '@material-ui/core/styles';

declare module '@material-ui/core/styles/createPalette' {
     interface Palette {
          borderColor?: Palette['primary'];
     }
     interface PaletteOptions {
          borderColor?: PaletteOptions['primary'];
     }
}