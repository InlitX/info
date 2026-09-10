const PLAYLIST = [
	{
		title: "Sum 2 Prove",
		artist: "Lil Baby",
		src: "./static/audio/lil-baby-sum-2-prove.mp3",
		accent: "#1f61d1",
		cover: "./static/img/covers/lil-baby-sum-2-prove.webp"
	},
	{
		title: "The Box",
		artist: "Roddy Ricch",
		src: "./static/audio/roddy-ricch-the-box.mp3",
		accent: "#d15ed1",
		cover: "./static/img/covers/roddy-ricch-the-box.webp"
	},
	{
		title: "F.N",
		artist: "Lil Tjay",
		src: "./static/audio/lil-tjay-fn.mp3",
		accent: "#705ed1",
		cover: "./static/img/covers/lil-tjay-fn.webp"
	},
	{
		title: "Sin Tanto Royo",
		artist: "Luis Tito",
		src: "./static/audio/luis-tito-sin-tanto-royo.mp3",
		accent: "#d18c5e",
		cover: "./static/img/covers/luis-tito-sin-tanto-royo.webp"
	},
	{
		title: "Painting Pictures",
		artist: "Superstar",
		src: "./static/audio/superstar-painting-pictures.mp3",
		accent: "#d18154",
		cover: "./static/img/covers/superstar-painting-pictures.webp"
	}
];

(function () {
	const root = document.getElementById("player");
	if (!root || !PLAYLIST.length) return;

	const SVG = 'viewBox="0 -960 960 960" aria-hidden="true"';
	const ICON_PLAY = '<svg ' + SVG + '><path d="M340-250v-460l360 230-360 230Z"/></svg>';
	const ICON_PAUSE = '<svg ' + SVG + '><path d="M600-200v-560h140v560H600Zm-380 0v-560h140v560H220Z"/></svg>';
	const SPEAKER = 'M120-360v-240h160l200-200v640L280-360H120Z';
	const ICON_VOL = '<svg ' + SVG + '><path d="' + SPEAKER + '"/>' +
		'<path d="M560-320v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/></svg>';
	const ICON_MUTE = '<svg ' + SVG + '><path d="' + SPEAKER + '"/>' +
		'<path fill="none" stroke="currentColor" stroke-width="70" stroke-linecap="round" ' +
		'd="M600-560 760-400M760-560 600-400"/></svg>';

	const audio = new Audio();
	audio.preload = "none";
	audio.volume = 0.6;

	const el = {
		cover: root.querySelector(".playerCover span"),
		title: root.querySelector(".playerTitle"),
		artist: root.querySelector(".playerArtist"),
		seek: root.querySelector(".playerSeek"),
		now: root.querySelector(".t-now"),
		dur: root.querySelector(".t-dur"),
		play: root.querySelector(".play"),
		prev: root.querySelector(".prev"),
		next: root.querySelector(".next"),
		list: root.querySelector(".playerList"),
		mini: document.getElementById("miniList"),
		toggle: root.querySelector(".listToggle"),
		mute: root.querySelector(".mute"),
		vol: root.querySelector(".playerVol input")
	};

	let index = 0;
	let scrubbing = false;
	let pending = -1;

	function paintVolume() {
		const off = audio.muted || audio.volume === 0;
		el.mute.innerHTML = off ? ICON_MUTE : ICON_VOL;
		el.mute.setAttribute("aria-label", off ? "Unmute" : "Mute");
		root.classList.toggle("muted", off);
	}

	function setProgress(p) {
		root.style.setProperty("--pl-p", p + "%");
	}

	function fmt(s) {
		if (!isFinite(s)) return "0:00";
		return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
	}

	function buildList() {
		el.list.innerHTML = '<div class="playerListInner">' + PLAYLIST.map(function (t, i) {
			return '<button type="button" data-i="' + i + '">' +
				'<i class="th" style="background-image:url(' + t.cover + ')">' +
				'<b class="eq"><s></s><s></s><s></s></b></i>' +
				'<span class="tx"><span class="t">' + t.title + "</span>" +
				'<span class="a">' + t.artist + "</span></span></button>";
		}).join("") + "</div>";

		if (el.mini) {
			el.mini.innerHTML = PLAYLIST.map(function (t, i) {
				return '<button type="button" data-i="' + i + '">' +
					'<i class="th" style="background-image:url(' + t.cover + ')"></i>' +
					'<span class="t">' + t.title + "</span></button>";
			}).join("");
		}

		buttons().forEach(function (b) {
			b.addEventListener("click", function () { load(Number(b.dataset.i), true); });
		});
	}

	function buttons() {
		const all = Array.prototype.slice.call(el.list.querySelectorAll("button"));
		if (el.mini) Array.prototype.push.apply(all, el.mini.querySelectorAll("button"));
		return all;
	}

	function load(i, autoplay) {
		index = (i + PLAYLIST.length) % PLAYLIST.length;
		const t = PLAYLIST[index];

		audio.src = t.src;
		el.title.textContent = t.title;
		el.title.title = t.title + " — " + t.artist;
		el.artist.textContent = t.artist;
		root.style.setProperty("--pl-accent", t.accent);
		el.cover.style.backgroundImage = "url(" + t.cover + ")";
		pending = -1;
		setProgress(0);
		el.now.textContent = "0:00";
		el.dur.textContent = "--:--";

		buttons().forEach(function (b) {
			b.classList.toggle("current", Number(b.dataset.i) === index);
		});

		if (autoplay) audio.play().catch(function () { });
	}

	function progress() {
		if (scrubbing || !audio.duration) return;
		setProgress((audio.currentTime / audio.duration) * 100);
		el.now.textContent = fmt(audio.currentTime);
	}

	function aim(clientX) {
		const r = el.seek.getBoundingClientRect();
		pending = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
		setProgress(pending * 100);
		if (isFinite(audio.duration)) el.now.textContent = fmt(pending * audio.duration);
	}

	function commit() {
		if (pending < 0) return;
		if (!isFinite(audio.duration)) {
			if (audio.preload === "none") audio.load();
			return;
		}
		audio.currentTime = pending * audio.duration;
		el.now.textContent = fmt(audio.currentTime);
		pending = -1;
	}

	audio.addEventListener("timeupdate", progress);

	audio.addEventListener("loadedmetadata", function () {
		el.dur.textContent = fmt(audio.duration);
		if (!scrubbing) commit();
	});

	audio.addEventListener("play", function () {
		root.classList.add("playing");
		el.play.innerHTML = ICON_PAUSE;
	});

	audio.addEventListener("pause", function () {
		root.classList.remove("playing");
		el.play.innerHTML = ICON_PLAY;
	});

	audio.addEventListener("ended", function () { load(index + 1, true); });

	audio.addEventListener("error", function () {
		el.artist.textContent = "could not load the track";
		root.classList.remove("playing");
		el.play.innerHTML = ICON_PLAY;
	});

	el.play.addEventListener("click", function () {
		if (audio.paused) audio.play().catch(function () { });
		else audio.pause();
	});

	el.prev.addEventListener("click", function () { load(index - 1, !audio.paused); });
	el.next.addEventListener("click", function () { load(index + 1, !audio.paused); });
	el.toggle.addEventListener("click", function () {
		const open = root.classList.toggle("open");
		el.toggle.setAttribute("aria-expanded", open ? "true" : "false");
	});
	el.vol.addEventListener("input", function () {
		audio.volume = Number(el.vol.value);
		audio.muted = audio.volume === 0;
		paintVolume();
	});

	el.mute.addEventListener("click", function () {
		audio.muted = !audio.muted;
		paintVolume();
	});

	el.seek.addEventListener("pointerdown", function (e) {
		scrubbing = true;
		el.seek.setPointerCapture(e.pointerId);
		aim(e.clientX);
	});

	el.seek.addEventListener("pointermove", function (e) {
		if (scrubbing) aim(e.clientX);
	});

	el.seek.addEventListener("lostpointercapture", function () {
		if (!scrubbing) return;
		scrubbing = false;
		commit();
	});

	el.seek.addEventListener("pointerup", function (e) {
		if (!scrubbing) return;
		scrubbing = false;
		el.seek.releasePointerCapture(e.pointerId);
		commit();
	});

	el.seek.addEventListener("pointercancel", function () {
		scrubbing = false;
		pending = -1;
	});

	document.addEventListener("keydown", function (e) {
		if (e.code !== "Space") return;
		if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
		e.preventDefault();
		el.play.click();
	});

	buildList();
	load(0, false);
	el.play.innerHTML = ICON_PLAY;
	el.vol.value = audio.volume;
	paintVolume();
})();
