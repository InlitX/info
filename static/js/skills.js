const SKILLS = [
	["Flutter", "flutter"],
	["Dart", "dart"],
	["Kotlin", "kotlin"],
	["Java", "java"],
	["Python", "python"],
	["TypeScript", "typescript"],
	["JavaScript", "javascript"],
	["HTML", "html"],
	["CSS", "css"],
	["Node.js", "nodejs"],
	["Android Studio", "androidstudio"],
	["Tauri", "tauri"],
	["n8n", "n8n"],
	["Linux", "linux"],
	["Bash", "bash"],
	["Docker", "docker"],
	["Git", "git"],
	["GitHub", "github"],
	["VS Code", "vscode"],
	["Figma", "figma"],
	["Obsidian", "obsidian"]
];

const LOOP_SPEED = 90;
const LOOP_HOVER_SPEED = 0;
const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

(function () {
	const loop = document.getElementById("skillLoop");
	const track = document.getElementById("skillTrack");
	if (!loop || !track) return;

	const items = SKILLS.map(function (skill) {
		const name = skill[0];
		const slug = skill[1];
		return '<li class="logoloop__item" role="listitem">' +
			'<span class="logoloop__node" title="' + name + '">' +
			'<img src="./static/icons/' + slug + '.svg" alt="' + name + '" loading="lazy">' +
			"</span></li>";
	}).join("");

	function listHTML() {
		return '<ul class="logoloop__list" role="list" aria-label="Technology stack">' + items + "</ul>";
	}

	let copies = MIN_COPIES;
	let seqWidth = 0;

	function build() {
		let html = "";
		for (let i = 0; i < copies; i++) html += listHTML();
		track.innerHTML = html;
	}

	function measure() {
		const first = track.querySelector(".logoloop__list");
		if (!first) return;
		seqWidth = Math.ceil(first.getBoundingClientRect().width);
		if (seqWidth <= 0) return;

		const needed = Math.ceil(loop.clientWidth / seqWidth) + COPY_HEADROOM;
		const next = Math.max(MIN_COPIES, needed);
		if (next !== copies) {
			copies = next;
			build();
		}
	}

	build();
	measure();

	if (window.ResizeObserver) {
		const ro = new ResizeObserver(measure);
		ro.observe(loop);
		const first = track.querySelector(".logoloop__list");
		if (first) ro.observe(first);
	} else {
		window.addEventListener("resize", measure);
	}

	track.querySelectorAll("img").forEach(function (img) {
		if (img.complete) return;
		img.addEventListener("load", measure, { once: true });
		img.addEventListener("error", measure, { once: true });
	});

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	let hovered = false;
	loop.addEventListener("pointerenter", function () { hovered = true; });
	loop.addEventListener("pointerleave", function () { hovered = false; });

	let offset = 0;
	let velocity = 0;
	let last = null;

	function frame(now) {
		if (last === null) last = now;
		const dt = Math.max(0, now - last) / 1000;
		last = now;

		const target = hovered ? LOOP_HOVER_SPEED : LOOP_SPEED;
		const ease = 1 - Math.exp(-dt / SMOOTH_TAU);
		velocity += (target - velocity) * ease;

		if (seqWidth > 0) {
			offset += velocity * dt;
			offset = ((offset % seqWidth) + seqWidth) % seqWidth;
			track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
		}

		requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
})();
