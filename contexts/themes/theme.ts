import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};
const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        backgroundColor: "gray.brand",
        lineHeight: "tall",
        color: 'white'
      },
      "option": {
        color: "gray.brand"
      }
    },
  },
  config,
  colors: {
    yellow: {
      brand: "#FFE600",
    },
    gray: {
      brand: "#2E2E38",
    },
  },
});

// as default export
export default theme

// as named export
export { theme }