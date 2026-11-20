const load = document.getElementById('loading');
const CHANNELS_URL = "https://6afaee8a730c1d152f32c54c.mockapi.io/api/v2/data";

export async function getCountriesApi() {
    try {
        load.classList.remove('hidden')
        load.classList.add('flex')

        const res = await fetch("https://iptv-org.github.io/api/countries.json");
        if (!res.ok) {
            throw new Error("Countries API Error");
        }
        const countries = await res.json();
        return countries;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        load.classList.remove('flex')
        load.classList.add('hidden')
    }
}

