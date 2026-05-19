import axios from 'axios';

async function test() {
  const customUrls = [
    'https://jiosaavn-api-sumitkolhe.vercel.app',
    'https://jiosaavn-api-ashutosh.vercel.app',
    'https://jiosaavn-api-one.vercel.app',
    'https://jiosaavn-api.vercel.app',
    'https://jiosaavnapi.vercel.app',
    'https://saavn-api.vercel.app',
    'https://jiosaavn-api-v2.vercel.app'
  ];

  for (const url of customUrls) {
    console.log(`Testing: ${url}`);
    try {
      const res = await axios.get(`${url}/api/search/songs?query=perfect`, { timeout: 4000 });
      console.log(`-> Status:`, res.status);
      const data = res.data?.data?.results || res.data?.data || res.data;
      if (data && data.length > 0) {
        console.log(`-> SUCCESS! Found working URL: ${url}`);
        break;
      }
    } catch (err) {
      console.log(`-> Failed:`, err.message);
    }
  }
}

test();
