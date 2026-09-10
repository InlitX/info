const ASSET_VERSION = 63;

function setCookie(name, value, days) {
	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
	const nameEQ = name + "=";
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i];
		while (cookie.charAt(0) === " ") cookie = cookie.substring(1);
		if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
	}
	return null;
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

(function () {
	const nav = document.getElementById("nav");
	if (!nav) return;

	const sync = function () {
		nav.classList.toggle("stuck", window.scrollY > 12);
	};

	window.addEventListener("scroll", sync, { passive: true });
	sync();
})();

(function () {
	const nav = document.getElementById("nav");
	const btn = document.getElementById("menuBtn");
	if (!nav || !btn) return;

	const close = function () {
		nav.classList.remove("menuOpen");
		btn.setAttribute("aria-expanded", "false");
	};

	btn.addEventListener("click", function () {
		const open = nav.classList.toggle("menuOpen");
		btn.setAttribute("aria-expanded", open ? "true" : "false");
	});

	nav.querySelectorAll(".mobileMenu a").forEach(function (a) {
		a.addEventListener("click", close);
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") close();
	});
})();

(function () {
	const html = document.documentElement;
	const btn = document.getElementById("themeBtn");
	const meta = document.querySelector('meta[name="theme-color"]');

	function paint(theme) {
		const snake = document.getElementById("snake");
		html.dataset.theme = theme;
		if (snake) snake.src = "./static/svg/snake.svg?v=" + ASSET_VERSION;
		if (meta) meta.setAttribute("content", theme === "Dark" ? "#0a0a0a" : "#101216");
		setCookie("themeState", theme, 365);
	}

	let theme = getCookie("themeState");
	if (theme !== "Dark" && theme !== "Light") theme = "Dark";
	paint(theme);

	if (!btn) return;

	const flip = function () {
		theme = theme === "Dark" ? "Light" : "Dark";
		paint(theme);
	};

	btn.addEventListener("click", function () {
		if (document.startViewTransition && !prefersReducedMotion()) {
			document.startViewTransition(flip);
			return;
		}
		flip();
	});
})();

(function () {
	const el = document.querySelector(".brand .scramble");
	if (!el) return;

	const text = el.dataset.text || el.textContent;
	const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789_-/";

	el.textContent = "";
	const spans = text.split("").map(function (char) {
		const span = document.createElement("span");
		span.textContent = char;
		el.appendChild(span);
		return span;
	});

	let frame = 0;

	function settle() {
		spans.forEach(function (span, i) {
			span.textContent = text[i];
		});
	}

	function run(duration) {
		if (prefersReducedMotion()) return settle();
		cancelAnimationFrame(frame);
		const start = performance.now();

		const step = function (now) {
			const progress = Math.min((now - start) / duration, 1);
			const settled = progress * text.length;

			spans.forEach(function (span, i) {
				span.textContent = i <= settled ? text[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
			});

			if (progress < 1) frame = requestAnimationFrame(step);
			else settle();
		};

		frame = requestAnimationFrame(step);
	}

	el.closest(".brand").addEventListener("mouseenter", function () {
		run(600);
	});

	run(900);
})();

(function () {
	const clock = document.getElementById("clock");
	if (!clock) return;

	const format = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", hour12: false });

	const tick = function () {
		clock.textContent = format.format(new Date()) + " your time";
	};

	tick();
	setInterval(tick, 20000);
})();

(function () {
	const vinyl = document.getElementById("vinyl");
	const player = document.getElementById("player");
	if (!vinyl || !player) return;

	vinyl.addEventListener("click", function () {
		const play = player.querySelector(".play");
		if (play) play.click();
	});

	const sync = function () {
		const playing = player.classList.contains("playing");
		document.body.classList.toggle("audioOn", playing);
		vinyl.setAttribute("aria-label", playing ? "Pause music" : "Play music");
	};

	new MutationObserver(sync).observe(player, { attributes: true, attributeFilter: ["class"] });
	sync();
})();

(function () {
	const stack = document.getElementById("vinylStack");
	const btn = document.getElementById("vinylListBtn");
	const list = document.getElementById("miniList");
	if (!stack || !btn || !list) return;

	const close = function () {
		if (!stack.classList.contains("open")) return;
		stack.classList.remove("open");
		btn.setAttribute("aria-expanded", "false");
	};

	btn.addEventListener("click", function (e) {
		e.stopPropagation();
		const open = stack.classList.toggle("open");
		btn.setAttribute("aria-expanded", open ? "true" : "false");
	});

	document.addEventListener("click", function (e) {
		if (!stack.contains(e.target)) close();
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") close();
	});
})();

(function () {
	const copy = function (text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			return navigator.clipboard.writeText(text);
		}

		return new Promise(function (resolve, reject) {
			const input = document.createElement("textarea");
			input.value = text;
			input.setAttribute("readonly", "");
			input.style.position = "fixed";
			input.style.opacity = "0";
			document.body.appendChild(input);
			input.select();
			let ok = false;
			try {
				ok = document.execCommand("copy");
			} catch (e) {
				ok = false;
			}
			document.body.removeChild(input);
			ok ? resolve() : reject();
		});
	};

	const xmr = document.getElementById("xmrCopy");
	if (!xmr) return;

	const address = xmr.dataset.address;
	const tip = xmr.querySelector(".tip");
	const label = tip ? tip.textContent : "";
	let timer;

	const flash = function (ok) {
		if (tip) tip.textContent = ok ? "Copied!" : "Failed";
		xmr.classList.add("copied");
		clearTimeout(timer);
		timer = setTimeout(function () {
			if (tip) tip.textContent = label;
			xmr.classList.remove("copied");
		}, 1600);
	};

	const grab = function () {
		copy(address).then(function () {
			flash(true);
		}, function () {
			flash(false);
		});
	};

	xmr.addEventListener("click", grab);
})();

(function () {
	document.querySelectorAll(".cardShot img").forEach(function (img) {
		const drop = function () {
			img.remove();
		};
		if (img.complete && img.naturalWidth === 0) return drop();
		img.addEventListener("error", drop, { once: true });
	});
})();

(function () {
	const overlay = document.querySelector(".tc");
	if (!overlay) return;

	const main = overlay.querySelector(".tc-main");

	overlay.addEventListener("click", function () {
		overlay.classList.remove("active");
		if (main) main.classList.remove("active");
	});

	if (main) {
		main.addEventListener("click", function (event) {
			event.stopPropagation();
		});
	}
})();

document.addEventListener("DOMContentLoaded", function () {
	document.querySelectorAll(".stagger").forEach(function (group) {
		Array.prototype.forEach.call(group.children, function (child, i) {
			child.style.setProperty("--i", i);
		});
	});

	const items = document.querySelectorAll(".reveal");
	if (!items.length) return;

	if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
		items.forEach(function (el) {
			el.classList.add("in");
		});
		return;
	}

	const observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;
			entry.target.classList.add("in");
			observer.unobserve(entry.target);
		});
	}, { rootMargin: "0px 0px -70px 0px", threshold: 0.04 });

	items.forEach(function (el) {
		observer.observe(el);
	});
});

window.addEventListener("load", function () {
	const loader = document.querySelector("#loader");
	if (!loader) return;

	setTimeout(function () {
		loader.addEventListener("transitionend", function () {
			loader.remove();
		});
		loader.classList.add("gone");
	}, 120);
});
