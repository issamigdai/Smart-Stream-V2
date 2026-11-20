import { getCountriesApi, getChannelsApi, updateFavoriteApi, updateBlacklistApi } from './api.js'

let countries = [];
let channels = [];
let loadFailed = false;

try {
    countries = await getCountriesApi();
    channels = await getChannelsApi();
} catch (error) {
    loadFailed = true;
}

const selectedChannels = [];
const selectedCountries = [];
const streamByChannel = {};

let currentCountry = '';
let currentCategory = 'All';
let currentView = 'all';

for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    if (channel.id && channel.url) {
        selectedChannels.push(channel);
        streamByChannel[channel.id] = channel.url;
    }
}

const wantedCountries = ["MA", "FR", "ES", "US", "GB", "DE", "BR", "CN", "KR", "JP"];
for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (wantedCountries.includes(country.code)) {
        selectedCountries.push(country);
    }
}

const Categorie = document.getElementById('Categorie');

function filter() {
    const text = document.getElementById('input').value.toLowerCase().trim();
    const result = [];

    selectedChannels.forEach(channel => {
        const Country = !currentCountry || channel.country === currentCountry;
        const Text = channel.name.toLowerCase().includes(text);
        const Category =
            currentCategory === 'All' ||
            (channel.category || '').toLowerCase() === currentCategory.toLowerCase();
        const inBlacklist = !!channel.isBlacklisted;
        const View =
            currentView === 'blacklist'
                ? inBlacklist
                : !inBlacklist && (currentView === 'all' || channel.isFavorite);

        if (Country && Text && Category && View) {
            result.push(channel);
        }
    });

    return result;
}

