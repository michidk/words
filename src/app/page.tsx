import { Metadata } from "next";
import { getRandomWord } from "../components/actions";
import WordDisplay from "../components/word-display";

export default async function PageComponent(
    props: {
        searchParams: Promise<{ word?: string }>;
    }
) {
    const searchParams = await props.searchParams;
    const word = searchParams.word || (await getRandomWord());

    return (
		<main className="min-h-screen w-full flex items-center justify-center">
			<WordDisplay initialWord={word} />
		</main>
	);
}
