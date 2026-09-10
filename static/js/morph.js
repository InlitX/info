(function () {
	if (!window.MORPH_SHAPES) return;

	var FROM = MORPH_SHAPES.squircle;
	if (!FROM) return;

	var SVG_NS = "http://www.w3.org/2000/svg";
	var sprite = document.createElementNS(SVG_NS, "svg");
	sprite.setAttribute("class", "morphDefs");
	sprite.setAttribute("aria-hidden", "true");
	sprite.setAttribute("focusable", "false");
	var defs = document.createElementNS(SVG_NS, "defs");
	sprite.appendChild(defs);
	document.body.appendChild(sprite);

	var count = 0;

	function attach(hoverEl, shapeEl, toName) {
		if (!hoverEl || !shapeEl) return null;
		var to = MORPH_SHAPES[toName];
		if (!to) return null;
		var id = "morphClip" + count++;

		var clipPath = document.createElementNS(SVG_NS, "clipPath");
		clipPath.setAttribute("id", id);
		clipPath.setAttribute("clipPathUnits", "objectBoundingBox");

		var path = document.createElementNS(SVG_NS, "path");
		path.setAttribute("class", "morphShape");
		path.setAttribute("d", FROM);
		clipPath.appendChild(path);
		defs.appendChild(clipPath);

		shapeEl.style.setProperty("--morph-clip", "url(#" + id + ")");

		var hovering = false;
		var forced = false;
		function sync() {
			path.style.d = "path('" + (hovering || forced ? to : FROM) + "')";
		}

		hoverEl.addEventListener("mouseenter", function () {
			hovering = true;
			sync();
		});
		hoverEl.addEventListener("mouseleave", function () {
			hovering = false;
			sync();
		});

		return { setActive: function (active) { forced = active; sync(); } };
	}

	attach(document.querySelector(".logo"), document.querySelector(".logoShape"), "cookie9");

	var playerMorph = attach(document.querySelector(".playerCover"), document.querySelector(".playerCover span"), "cookie9");
	var playerRoot = document.getElementById("player");
	if (playerMorph && playerRoot) {
		var syncPlaying = function () {
			playerMorph.setActive(playerRoot.classList.contains("playing"));
		};
		new MutationObserver(syncPlaying).observe(playerRoot, { attributes: true, attributeFilter: ["class"] });
		syncPlaying();
	}
})();
