export const lightTheme = {
    palette: {
        primary: {
            main: '#4f3cc9'
        },
        borderColor: {
            main: '#e0e0e3',
            light: '#e6e6e8',
            dark: '#b3b3b5'
        },
        secondary: {
            light: '#5f5fc4',
            main: '#283593',
            dark: '#001064',
            contrastText: '#fff',
        },
        background: {
            default: '#fcfcfe',
        },
        type: 'light' as 'light',
    },
    shape: {
        borderRadius: 10,
    },
    sidebar: {
        width: 220,
    },
    components: {
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    borderLeft: '3px solid #fff',
                    '&.RaMenuItemLink-active': {
                        borderLeft: '3px solid #4f3cc9',
                    },
                },
            }
        },
        RaSimpleFormIterator: {
            styleOverrides: {
                indexContainer: {
                    display: 'none'
                }
            }
        },
        RaFileInput: {
            styleOverrides: {
                dropZone: {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    border: '2px solid rgba(0, 0, 0, 0.04)',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: '#4f3cc9',
                        transition: 'all 0.2s ease',
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                elevation1: {
                    boxShadow: 'none',
                },
                root: {
                    border: '1px solid #e0e0e3',
                    backgroundClip: 'padding-box',
                },
            }
        },
        MuiButtonBase: {
            defaultProps: {
                // disable ripple for perf reasons
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    '&:hover:active::after': {
                        // recreate a static ripple color
                        // use the currentColor to make it work both for outlined and contained buttons
                        // but to dim the background without dimming the text,
                        // put another element on top with a limited opacity
                        content: '""',
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'currentColor',
                        opacity: 0.3,
                        borderRadius: 'inherit',
                    },
                },
            }
        },
        MuiAppBar: {
            styleOverrides: {
                colorSecondary: {
                    color: '#808080',
                    backgroundColor: '#fff',
                },
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: '#f5f5f5',
                },
                barColorPrimary: {
                    backgroundColor: '#d7d7d7',
                },
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&$disabled': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                },
            }
        },
        MuiSnackbarContent: {
            styleOverrides: {
                root: {
                    border: 'none',
                },
            }
        },
        chipContainerFilled: {
            styleOverrides: {
                suggestionsContainer: {
                    display: 'none'
                }
            }
        }
    }
};
