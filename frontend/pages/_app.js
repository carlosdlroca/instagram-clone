import {useEffect} from "react";
import Head from "next/head"
import Layout from '../components/Layout'
import '../styles/globals.css'

import { colors } from "../constants/styles";

function MyApp({ Component, pageProps }) {

  useEffect(() => {

    // For every color in the CONSTANTS file, set the global css variable.
    Object.entries(colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(`--${property}`, value);
    });

  }, [])

  return (
    <Layout>
      <Head>
        <meta name="theme-color" content={colors['color-primary']} />
      </Head>
      <Component {...pageProps} />
    </Layout>
  ); 

}

export default MyApp
