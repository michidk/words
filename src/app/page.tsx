import { Metadata } from "next";
import { getRandomWord } from "./actions";
import WordDisplay from "../components/word-display";

export default async function PageComponent({
	searchParams,
}: {
	searchParams: { word?: string };
}) {
	const word = searchParams.word || (await getRandomWord());

	return (
		<main className="min-h-screen w-full flex items-center justify-center">
			<WordDisplay initialWord={word} />
		</main>
	);
}
