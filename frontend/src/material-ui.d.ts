import { PaletteOptions, Palette } from "@mui/material/styles/createPalette";

// PATCH for TS and the Theme to add custom colors

declare module '@mui/material/styles/createPalette' {
    export interface Palette {
        borderColor?: Palette['primary'];
    }
    export interface PaletteOptions {
        borderColor?: PaletteOptions['primary'];
    }
}