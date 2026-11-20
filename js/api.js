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

export async function getChannelsApi() {
    try {
        load.classList.remove('hidden')
        load.classList.add('flex')
        const res = await fetch(CHANNELS_URL);
        if (!res.ok) {
            throw new Error("Something went wrong");
        }
        const channels = await res.json();
        return channels;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        load.classList.remove('flex')
        load.classList.add('hidden')
    }
}

export async function updateChannelApi(id, data) {
    const res = await fetch(`${CHANNELS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error(`Update failed (${res.status})`);
    }
    return await res.json();
}

export async function addChannelApi(data) {
    const res = await fetch(CHANNELS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error(`Add failed (${res.status})`);
    }
    return await res.json();
}

export function updateFavoriteApi(id, status) {
    return updateChannelApi(id, { isFavorite: status });
}
export function updateBlacklistApi(id, status) {
    return updateChannelApi(id, { isBlacklisted: status });
}