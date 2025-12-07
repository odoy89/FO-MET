import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* CDN Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
