import { CacheProvider, EmotionCache } from "@emotion/react";
import { ThemeProvider, CssBaseline, useMediaQuery } from "@mui/material";

import createEmotionCache from "../utility/create-emotion-cache";
import { darkTheme, lightTheme } from "../styles/theme/themes";
import "../styles/globals.css";
import { AppProps } from "next/app";

const clientSideEmotionCache = createEmotionCache();

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: AppProps & { emotionCache?: EmotionCache }) {
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)");
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={prefersLight ? lightTheme : darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;
