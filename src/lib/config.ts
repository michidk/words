function urlify(url: string): string {
	if (url.startsWith("http") || url.startsWith("https")) {
		return url;
	}
	return `https://${url}`;
}

function getServerUrl(): string {
	return urlify(
		process.env.NEXT_PUBLIC_SITE_URL ||
			process.env.NEXT_PUBLIC_VERCEL_URL ||
			process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ||
			"http://localhost:3000",
	);
}
export type SiteConfig = typeof siteConfig;
export const siteConfig = {
	name: "words.",
	description: "Displays a random word with a random style.",
	links: {
		github: "https://github.com/michidk/word",
	},
	url: getServerUrl(),
};
