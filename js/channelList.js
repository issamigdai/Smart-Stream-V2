import { getCountriesApi, getChannelsApi, addChannelApi, updateFavoriteApi, updateBlacklistApi } from './api.js'

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
let currentView = localStorage.getItem('currentView') || 'all';

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

document.getElementById('channelList').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    let channel = null;
    for (let i = 0; i < selectedChannels.length; i++) {
        if (selectedChannels[i].id == id) {
            channel = selectedChannels[i];
        }
    }
    if (!channel) return;
    if (e.target.closest('[data-action="favorite"]')) {
        const previous = channel.isFavorite;
        channel.isFavorite = !previous;
        displaychannels();
        try {
            await updateFavoriteApi(channel.id, channel.isFavorite);
        } catch (error) {
            console.error(error);
            channel.isFavorite = previous;
            displaychannels();
        }
        return;
    }

    if (e.target.closest('[data-action="blacklist"]')) {
        const previous = channel.isBlacklisted;
        const message = previous
            ? 'Remove this channel from the blacklist?'
            : 'Add this channel to the blacklist?';

        if (!confirm(message)) return;
        channel.isBlacklisted = !previous;
        displaychannels();
        try {
            await updateBlacklistApi(channel.id, channel.isBlacklisted);
        } catch (error) {
            console.error(error);
            channel.isBlacklisted = previous;
            displaychannels();
        }
        return;
    }


    const countryName = selectedCountries.find(c => c.code === channel.country)?.name ?? channel.country;
    const streamUrl = streamByChannel[channel.id];
    const list = document.getElementById('main');

    list.innerHTML = `
        <div class="flex flex-col gap-6">
            <div class="flex flex-row gap-4 items-center">
                <div class="flex flex-col">
                    <strong class="font-bold font-sans text-md text-white">
                        ${channel.name}
                    </strong>
                    <small class="font-sans text-[#94A3B8]">
                        ${countryName} · ${channel.category}
                    </small>
                </div>
            </div>
            <div id="playerHolder">
                <video-player>
                    <video-skin style="display: block; width: 100%; aspect-ratio: 16 / 9; --media-controls-before-start: visible;">
                        <hlsjs-video src="${streamUrl}" playsinline></hlsjs-video>
                    </video-skin>
                </video-player>
            </div>
        </div>
    `;
});

document.getElementById('input').addEventListener('input', function () {
    displaychannels();
});

Categorie.addEventListener('change', function () {
    currentCategory = Categorie.value;
    displaychannels();
});

function showActiveView() {
    const buttons = document.querySelectorAll('#viewButtons button');
    buttons.forEach(button => {
        if (button.dataset.view === currentView) {
            button.classList.add('bg-white', 'text-[#0F172A]');
            button.classList.remove('text-white', 'hover:bg-blue-900');
        } else {
            button.classList.remove('bg-white', 'text-[#0F172A]');
            button.classList.add('text-white', 'hover:bg-blue-900');
        }
    });
}

displayConteries();
displaychannels();
showActiveView();

document.getElementById('viewButtons').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    currentView = btn.dataset.view;
    if (currentView !== 'blacklist') {
        localStorage.setItem('currentView', currentView);
    }
    showActiveView();
    displaychannels();
});

const popUp = document.getElementById('popUp');
const channelForm = document.getElementById('channelForm');
const formError = document.getElementById('formError');
let selectedCategory = '';

function showSelectedCategory() {
    const buttons = document.querySelectorAll('#categoryButtons button');
    buttons.forEach(button => {
        if (button.dataset.category === selectedCategory) {
            button.classList.add('bg-blue-800');
        } else {
            button.classList.remove('bg-blue-800');
        }
    });
}

function closePopUp() {
    popUp.classList.remove('flex');
    popUp.classList.add('hidden');
    channelForm.reset();
    formError.textContent = '';
    selectedCategory = '';
    showSelectedCategory();
}

document.getElementById('addChannelBtn').addEventListener('click', function () {
    popUp.classList.remove('hidden');
    popUp.classList.add('flex');
});

document.getElementById('cancelBtn').addEventListener('click', closePopUp);

document.getElementById('categoryButtons').addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    selectedCategory = btn.dataset.category;
    showSelectedCategory();
});

channelForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const number = document.getElementById('channelNumber').value.trim();
    const name = document.getElementById('channelName').value.trim();

    if (!number || !name) {
        formError.textContent = 'Please fill in the channel number and name.';
        return;
    }

    try {
        const newChannel = await addChannelApi({
            number: number,
            name: name,
            url: document.getElementById('channelUrl').value.trim(),
            country: document.getElementById('Country').value,
            category: selectedCategory,
            logo: document.getElementById('channelLogo').value.trim(),
            isFavorite: false,
            isBlacklisted: false
        });
        selectedChannels.push(newChannel);
        streamByChannel[newChannel.id] = newChannel.url;
        displaychannels();
        closePopUp();
    } catch (error) {
        console.error(error);
        formError.textContent = 'Could not add the channel. Please try again.';
    }
});
