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

function displayConteries() {
    const container = document.getElementById('contrieHolder');
    let html = '';
    selectedCountries.forEach(countrie => {
        html += `
            <button type="button" data-code="${countrie.code}"
                class="flex h-16 w-full cursor-pointer items-center gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-left transition-colors hover:border-[#818CF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]">
                <img class="h-[20px] shrink-0"
                src="https://flagsapi.com/${countrie.code}/flat/64.png" alt="">
                <strong class="truncate font-sans text-[#F8FAFC]">
                    ${countrie.name}
                </strong>
            </button>
        `;
    });
    container.innerHTML = html;
    container.addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-code]');
        if (!btn) return;
        currentCountry = btn.dataset.code;
        displaychannels();
    });
}

function displaychannels() {
    const number = document.getElementById('number');

    if (loadFailed) {
        number.textContent = '';
        document.getElementById('channelList').innerHTML =
            `<p class="font-sans text-red-400">Could not load channels. Please try again.</p>`;
        return;
    }

    const filtered = filter();
    let html = '';

    filtered.forEach(channel => {
        html += `
            <button
    class="flex flex-row justify-between items-center h-[64px] bg-[#0F172A] p-3 gap-3 border border-[#1E293B] hover:border-[#818CF8] cursor-pointer rounded-lg w-full text-[#F8FAFC]"
    data-id="${channel.id}">
    <span>${channel.name}</span>
    <div class="flex flex-row gap-2 items-center">
        <span class="flex flex-row gap-3 items-center rounded cursor-pointer" data-action="favorite">
            <svg viewBox="0 0 24 24" class="w-5 h-5 ${channel.isFavorite ? 'stroke-yellow-400 fill-yellow-400' : 'stroke-white fill-transparent'}">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span class="text-white font-semibold font-sans"></span>
        </span>
        <span class="flex flex-row gap-3 items-center rounded cursor-pointer text-white" data-action="blacklist">
            ${currentView === 'blacklist' ? 'Restore' : '🚫'}
        </span>
    </div>
</button>
        `;
    });

    number.textContent = filtered.length + " channels";
    document.getElementById('channelList').innerHTML = html;
}
