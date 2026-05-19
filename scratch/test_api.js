import axios from 'axios';

async function test() {
  try {
    console.log("=== Testing musicapi.x007.workers.dev search ===");
    // The engines are gaama, seevn, hunjama, mtmusic, wunk
    const engines = ['seevn', 'gaama', 'hunjama', 'mtmusic', 'wunk'];
    for (const engine of engines) {
      try {
        console.log(`Trying engine: ${engine}...`);
        const searchResp = await axios.get(`https://musicapi.x007.workers.dev/search?q=shape+of+you&searchEngine=${engine}`, { timeout: 5000 });
        console.log(`Engine ${engine} results:`, Array.isArray(searchResp.data) ? searchResp.data.slice(0, 2) : searchResp.data);
        
        // If we got an ID, let's try /fetch
        const results = searchResp.data;
        const firstItem = Array.isArray(results) ? results[0] : (results?.data?.[0] || results?.results?.[0]);
        const id = firstItem?.id || firstItem?.Id || firstItem?.ID;
        if (id) {
          console.log(`Found ID: ${id}, fetching download URL...`);
          const fetchResp = await axios.get(`https://musicapi.x007.workers.dev/fetch?id=${id}`, { timeout: 5000 });
          console.log("Fetch response:", fetchResp.data);
          break;
        }
      } catch (err) {
        console.log(`Engine ${engine} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("General error:", err.message);
  }
}

test();
