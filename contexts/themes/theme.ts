import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};
const themeCustomColors = {
  yellow: {
    brand: "#FFE600",
  },
  gray: {
    brand: "#2E2E38",
  },
};
const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        backgroundColor: "gray.brand",
        lineHeight: "tall",
        color: "white",
      },
      option: {
        color: "white",
      },
    },
  },
  config,
  colors: themeCustomColors,
});

// as default export
export default theme

// as named export
export { theme, themeCustomColors };