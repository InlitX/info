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

const SINGLE_ICON = new Set(["n8n"]);

(function () {
	const grid = document.getElementById("skillGrid");
	if (!grid) return;

	grid.innerHTML = SKILLS.map(function (skill) {
		const name = skill[0];
		const slug = skill[1];
		const light = SINGLE_ICON.has(slug) ? slug + "-dark" : slug + "-light";
		return '<div class="skillItem" data-name="' + name + '">' +
			'<img class="ico-light" src="./static/icons/' + light + '.svg" alt="' + name + '" loading="lazy">' +
			'<img class="ico-dark" src="./static/icons/' + slug + '-dark.svg" alt="" loading="lazy">' +
			'</div>';
	}).join("");
})();
