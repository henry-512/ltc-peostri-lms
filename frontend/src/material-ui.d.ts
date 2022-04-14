// PATCH for TS and the Theme to add custom colors

declare module '@mui/material/styles/createPalette' {
    {
        interface Palette {
            borderColor?: Palette['primary'];
        }
        interface PaletteOptions {
            borderColor?: PaletteOptions['primary'];
        }
    }
}