import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const USER = process.argv[2] ?? "InlitX";

const LEVELS = [
	"NONE",
	"FIRST_QUARTILE",
	"SECOND_QUARTILE",
	"THIRD_QUARTILE",
	"FOURTH_QUARTILE",
];

const PALETTE = {
	colorDotBorder: "transparent",
	colorDots: ["#1a1a1c", "#35353a", "#5c5c63", "#8b8b93", "#bcbcc4"],
	colorEmpty: "#1a1a1c",
	colorSnake: "#ffffff",
};

const SIZES = { sizeDotBorderRadius: 2, sizeCell: 16, sizeDot: 12 };
const ANIMATION = { frameByStep: 1, stepDurationMs: 100 };

const res = await fetch(`https://github.com/users/${USER}/contributions`, {
	headers: { "User-Agent": "gen-snake" },
});
if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
const html = await res.text();

const counts = new Map();
for (const [, id, text] of html.matchAll(
	/<tool-tip[^>]*\bfor="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)<\/tool-tip>/g,
)) {
	const n = /^(\d+)\s+contribution/.exec(text.trim());
	counts.set(id, n ? Number(n[1]) : 0);
}

const weeks = [];
let days = 0;
for (const [, cell] of html.matchAll(/<td\b([^>]*\bclass="[^"]*ContributionCalendar-day[^"]*"[^>]*)>/g)) {
	const date = /\bdata-date="([^"]+)"/.exec(cell);
	const id = /\bid="(contribution-day-component-(\d+)-(\d+))"/.exec(cell);
	if (!date || !id) continue;

	const weekday = Number(id[2]);
	const week = Number(id[3]);
	const level = Number(/\bdata-level="(\d+)"/.exec(cell)?.[1] ?? 0);

	(weeks[week] ??= []).push({
		contributionCount: counts.get(id[1]) ?? 0,
		contributionLevel: LEVELS[level] ?? LEVELS[0],
		weekday,
		date: date[1],
	});
	days++;
}

if (!days) throw new Error("no contribution cells found, the page markup probably changed");

const payload = {
	data: {
		user: {
			contributionsCollection: {
				contributionCalendar: {
					weeks: weeks
						.filter(Boolean)
						.map((contributionDays) => ({
							contributionDays: contributionDays.sort((a, b) => a.weekday - b.weekday),
						})),
				},
			},
		},
	},
};

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) =>
	String(url).includes("api.github.com/graphql")
		? new Response(JSON.stringify(payload), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			})
		: realFetch(url, init);

const { generateSnakeAnimation } = await import("generate-snake-animation");

const results = await generateSnakeAnimation(
	{ platform: "github", username: USER, githubToken: "unused" },
	[{ format: "svg", drawOptions: { ...SIZES, ...PALETTE }, animationOptions: ANIMATION }],
);

const outDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"static",
	"svg",
);
fs.mkdirSync(outDir, { recursive: true });

const svg = results[0].replace(/<desc>[\s\S]*?<\/desc>/g, "");
fs.writeFileSync(path.join(outDir, "snake.svg"), svg);
console.log(`static/svg/snake.svg  ${(svg.length / 1024).toFixed(1)} KB`);

const active = [...counts.values()].filter((c) => c > 0).length;
console.log(`${USER}: ${weeks.filter(Boolean).length} weeks, ${days} days, ${active} active`);
